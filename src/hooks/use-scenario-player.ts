"use client";

import { useCallback, useReducer, useState } from "react";
import {
  conversationReducer,
  initialConversationState,
} from "@/lib/conversation-reducer";
import { SCENARIOS, type Scenario } from "@/lib/mock-scenarios";

export function useScenarioPlayer(initialScenarioId = SCENARIOS[0].id) {
  const [scenarioId, setScenarioId] = useState(initialScenarioId);
  const [stepIndex, setStepIndex] = useState(0);
  const [state, dispatch] = useReducer(
    conversationReducer,
    initialConversationState,
  );

  const scenario: Scenario =
    SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const isFinished = stepIndex >= scenario.steps.length;

  const next = useCallback(() => {
    if (isFinished) return;
    dispatch({ type: "apply", events: scenario.steps[stepIndex] });
    setStepIndex((i) => i + 1);
  }, [isFinished, scenario, stepIndex]);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    setStepIndex(0);
  }, []);

  const selectScenario = useCallback((id: string) => {
    const target = SCENARIOS.find((s) => s.id === id);
    if (!target) return;
    setScenarioId(id);
    dispatch({ type: "reset" });
    dispatch({ type: "apply", events: target.steps[0] });
    setStepIndex(1);
  }, []);

  return {
    scenarios: SCENARIOS,
    scenario,
    state,
    stepIndex,
    totalSteps: scenario.steps.length,
    isFinished,
    next,
    reset,
    selectScenario,
  };
}
