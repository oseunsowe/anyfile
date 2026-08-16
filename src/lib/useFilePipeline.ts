"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { analyzeFile, type FileAnalysis } from "@/lib/analyze";
import type { ActionHint } from "@/lib/intent";
import { buildPlan } from "@/lib/planner";
import { getCapabilities, supportsStep, toExecSteps } from "@/lib/ops/capabilities";
import {
  PipelineCancelled,
  runPipeline,
  type PipelineProgress,
  type PipelineResult,
} from "@/lib/ops/client";
import { evaluateRequirement, type Requirement } from "@/lib/requirement";

export type PipelinePhase = "idle" | "analyzing" | "ready" | "running" | "done" | "error";

/** §13 — a hard client-side ceiling before we even read the file. */
export const MAX_INPUT_BYTES = 100_000_000;

/** Capabilities never change, so nothing ever notifies this subscriber. */
const neverChanges = () => () => {};

/**
 * The whole task loop — diagnose, plan, run, prove — as one hook.
 *
 * Shared by the homepage SmartFix console and every tool page so the two paths
 * cannot drift: a tool page is just this loop with the requirement supplied by
 * the page instead of parsed from a sentence.
 */
/**
 * A step supplied by the tool page rather than derived from the Requirement.
 * Merging several PDFs is not expressible as "what the destination accepts",
 * so those tools declare the operation directly.
 */
export type LeadOperation = {
  id: "merge-pdf" | "images-to-pdf";
  title: string;
  reason: string;
  tool: string;
};

export function useFilePipeline({
  requirement,
  actions = [],
  lead,
}: {
  requirement: Requirement;
  actions?: readonly ActionHint[];
  lead?: LeadOperation;
}) {
  const [files, setFilesState] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [phase, setPhase] = useState<PipelinePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [disabledSteps, setDisabledSteps] = useState<ReadonlySet<string>>(new Set());
  const [progress, setProgress] = useState<PipelineProgress | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /**
   * Mirrors `files` so callbacks can append to the current queue without
   * depending on it — a dependency here would rebuild `handleFiles` on every
   * drop, and reading state inside a setState updater is unsafe under
   * StrictMode's double invocation.
   */
  const filesRef = useRef<File[]>([]);

  const setFiles = useCallback((next: File[]) => {
    filesRef.current = next;
    setFilesState(next);
  }, []);

  // Reads browser globals, so the server snapshot is null and the client picks
  // up real capabilities on hydration without a mismatch.
  const capabilities = useSyncExternalStore(neverChanges, getCapabilities, () => null);

  // Object URLs leak if the user runs several files in a row.
  useEffect(() => {
    if (!downloadUrl) return;
    return () => URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const plan = useMemo(() => {
    const derived = buildPlan({ analysis, requirement, actions });
    if (!lead) return derived;

    // The lead operation always runs first: it is what produces the document
    // everything downstream operates on.
    return [
      {
        id: lead.id,
        title: lead.title,
        reason: lead.reason,
        tool: lead.tool,
        processing: "device" as const,
        optional: false,
      },
      ...derived,
    ];
  }, [analysis, requirement, actions, lead]);

  /** Steps this browser genuinely cannot run, with the reason to show. */
  const blockers = useMemo(() => {
    if (!analysis || !capabilities) return [];
    return plan
      .filter((step) => !disabledSteps.has(step.id))
      .map((step) => ({ step, support: supportsStep(step, analysis.kind, capabilities) }))
      .flatMap(({ step, support }) =>
        support.ok ? [] : [{ id: step.id, title: step.title, reason: support.reason }],
      );
  }, [analysis, capabilities, plan, disabledSteps]);

  const canRun = plan.length > 0 && blockers.length === 0 && phase === "ready";

  /** Appends rather than replaces, so a second drop adds to a merge queue. */
  const handleFiles = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;

    setPhase("analyzing");
    setError(null);
    setResult(null);
    setDownloadUrl(null);

    const next = [...filesRef.current, ...incoming];
    setFiles(next);

    try {
      // The first file drives diagnosis; it is the one the plan is built for.
      setAnalysis(await analyzeFile(next[0]));
      setPhase("ready");
    } catch {
      setError("We could not read that file. Try another, or pick a tool directly.");
      setPhase("error");
    }
  }, [setFiles]);

  const removeFile = useCallback(
    (index: number) => {
      setFiles(filesRef.current.filter((_, position) => position !== index));
    },
    [setFiles],
  );

  /** Order is significant for a merge, so this is a real operation, not chrome. */
  const moveFile = useCallback(
    (index: number, direction: -1 | 1) => {
      const current = filesRef.current;
      const target = index + direction;
      if (target < 0 || target >= current.length) return;

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      setFiles(next);
    },
    [setFiles],
  );

  const run = useCallback(async () => {
    if (files.length === 0 || !analysis) return;

    const steps = toExecSteps(plan, requirement, disabledSteps);
    if (steps.length === 0) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("running");
    setError(null);
    setProgress({ percent: 0, label: "Starting", stepIndex: 0, stepCount: steps.length });

    try {
      const output = await runPipeline(files, steps, {
        signal: controller.signal,
        onProgress: setProgress,
      });
      setResult(output);
      setDownloadUrl(URL.createObjectURL(output.blob));
      setPhase("done");
    } catch (caught) {
      if (caught instanceof PipelineCancelled) {
        // Cancelling returns to the plan, never to an error or a dead end.
        setPhase("ready");
        setProgress(null);
        return;
      }
      setError(caught instanceof Error ? caught.message : "Processing failed.");
      setPhase("error");
    } finally {
      abortRef.current = null;
    }
  }, [analysis, disabledSteps, files, plan, requirement]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setFiles([]);
    setAnalysis(null);
    setResult(null);
    setDownloadUrl(null);
    setProgress(null);
    setPhase("idle");
    setError(null);
    setDisabledSteps(new Set());
  }, [setFiles]);

  const toggleStep = useCallback((id: string) => {
    setDisabledSteps((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Checks run against what we measured on the output, never on intent. */
  const checks = useMemo(() => {
    if (!result) return [];
    return evaluateRequirement(requirement, {
      bytes: result.blob.size,
      format: result.format,
      width: result.width,
      height: result.height,
      metadataStripped: result.metadataStripped,
    });
  }, [requirement, result]);

  return {
    analysis,
    blockers,
    canRun,
    cancel,
    checks,
    disabledSteps,
    downloadUrl,
    error,
    files,
    handleFiles,
    moveFile,
    phase,
    plan,
    progress,
    removeFile,
    reset,
    result,
    run,
    toggleStep,
  };
}
