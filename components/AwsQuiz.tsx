"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { deductGameCredit, submitScore } from "@/lib/actions";

const AWS_GAME_ID = "796aac6a-6cd4-48c6-af90-518bab836a84";

const QUESTIONS = [
  { difficulty: "Easy", question: "What is cloud computing?", options: ["Storing files only on a personal computer", "Accessing IT resources over the internet on demand", "Building physical computers", "Using the internet only for browsing"], answer: 1, explanation: "Cloud computing lets you access IT resources over the internet when you need them, often paying only for what you use." },
  { difficulty: "Easy", question: "What does AWS stand for?", options: ["Amazon Web Services", "Advanced Web Systems", "Automated Worldwide Servers", "Amazon Wireless Software"], answer: 0, explanation: "AWS stands for Amazon Web Services, Amazon's cloud computing platform." },
  { difficulty: "Easy", question: "Which company launched AWS?", options: ["Microsoft", "Google", "Amazon", "IBM"], answer: 2, explanation: "AWS was launched by Amazon in 2006." },
  { difficulty: "Easy", question: "Which AWS service provides virtual servers?", options: ["AWS Lambda", "Amazon DynamoDB", "Amazon EC2", "Amazon CloudFront"], answer: 2, explanation: "Amazon EC2 provides virtual computing capacity in the cloud." },
  { difficulty: "Easy", question: "Which AWS service is used to store photos and backups as objects?", options: ["Amazon S3", "AWS Lambda", "Amazon VPC", "AWS CloudTrail"], answer: 0, explanation: "Amazon S3 is object storage commonly used for files such as photos and backups." },
  { difficulty: "Easy", question: "Which service is commonly used for managed SQL databases?", options: ["Amazon CloudFront", "Amazon EC2", "Amazon RDS", "Amazon Route 53"], answer: 2, explanation: "Amazon RDS is a managed relational database service." },
  { difficulty: "Easy", question: "What is the main purpose of AWS Lambda?", options: ["Store archived files", "Run code without managing servers directly", "Manage encryption keys", "Register domain names"], answer: 1, explanation: "AWS Lambda runs code in response to events without requiring you to manage servers directly." },
  { difficulty: "Easy", question: "What does IAM help manage?", options: ["User identities and permissions", "Video streaming quality", "Database backups only", "Physical data centres"], answer: 0, explanation: "AWS IAM helps manage users, roles and permissions." },
  { difficulty: "Easy", question: "Which service helps deliver content quickly to users around the world?", options: ["Amazon RDS", "AWS CloudTrail", "Amazon CloudFront", "AWS IAM"], answer: 2, explanation: "Amazon CloudFront uses edge locations to deliver content with low latency." },
  { difficulty: "Easy", question: "What is an AWS Region?", options: ["A single user account", "A geographic area containing AWS infrastructure", "A type of database", "A security policy"], answer: 1, explanation: "A Region is a geographic area where AWS has infrastructure." },
  { difficulty: "Easy", question: "Which service is used to monitor metrics, logs and alarms?", options: ["Amazon S3", "Amazon DynamoDB", "AWS CloudFormation", "Amazon CloudWatch"], answer: 3, explanation: "Amazon CloudWatch monitors AWS resources and applications using metrics, logs and alarms." },
  { difficulty: "Easy", question: "What is the purpose of Multi-Factor Authentication (MFA)?", options: ["Add another layer of identity verification", "Increase storage capacity", "Reduce network latency", "Create virtual servers"], answer: 0, explanation: "MFA requires an additional proof of identity and adds a layer of account protection." },
  { difficulty: "Easy", question: "Which AWS service is designed for inexpensive long-term data archiving?", options: ["Amazon EC2", "Amazon S3 Glacier", "Amazon Route 53", "AWS Lambda"], answer: 1, explanation: "S3 Glacier storage classes are designed for low-cost archival storage." },
  { difficulty: "Easy", question: "Which certification is listed at the foundational level in the PPT?", options: ["AWS Certified DevOps Engineer – Professional", "AWS Certified Security – Specialty", "AWS Certified Cloud Practitioner", "AWS Certified Solutions Architect – Professional"], answer: 2, explanation: "The workshop lists AWS Certified Cloud Practitioner as a foundational certification." },
  { difficulty: "Moderate", question: "A website suddenly receives a large amount of traffic. Which combination can help distribute requests and automatically add servers?", options: ["S3 and Glacier", "CloudTrail and IAM", "Load Balancer and Auto Scaling", "RDS and Route 53"], answer: 2, explanation: "A Load Balancer distributes incoming traffic, while Auto Scaling can add or remove EC2 instances as demand changes." },
  { difficulty: "Moderate", question: "A company wants to keep old invoices at a low storage cost. Which service from the workshop is the best fit?", options: ["Amazon EC2", "Amazon S3 Glacier", "AWS Lambda", "Amazon CloudWatch"], answer: 1, explanation: "The workshop describes Glacier as low-cost storage for archived data." },
  { difficulty: "Moderate", question: "An administrator wants to find out who deleted a server. Which service should they use?", options: ["Amazon CloudFront", "Amazon EFS", "Amazon SageMaker", "AWS CloudTrail"], answer: 3, explanation: "AWS CloudTrail records account activity and API events for auditing." },
  { difficulty: "Moderate", question: "A company wants to build and train machine learning models on AWS. Which service should it consider?", options: ["Amazon SageMaker", "Amazon Route 53", "Amazon EBS", "AWS CloudTrail"], answer: 0, explanation: "Amazon SageMaker provides tools for building and training machine learning models." },
  { difficulty: "Moderate", question: "According to the Shared Responsibility Model, which task is the customer's responsibility?", options: ["Maintaining AWS data centre buildings", "Securing the physical hardware owned by AWS", "Managing access permissions and configuring cloud resources", "Maintaining AWS's global network infrastructure"], answer: 2, explanation: "Customers manage their data, access permissions and configurations, while AWS secures the underlying cloud infrastructure." },
  { difficulty: "Hard", question: "A food delivery app needs to store menu images, manage customer orders and monitor its application. Which combination best matches the workshop architecture?", options: ["CloudTrail for images, Glacier for orders and IAM for monitoring", "S3 for images, RDS or DynamoDB for orders and CloudWatch for monitoring", "Lambda for image storage, CloudFront for orders and S3 for monitoring", "Route 53 for images, EC2 for database storage and Glacier for monitoring"], answer: 1, explanation: "The workshop describes S3 for images, RDS or DynamoDB for order data and CloudWatch for monitoring." },
] as const;

function shuffleQuestions() {
  const shuffled = [...QUESTIONS];

  // Fisher-Yates shuffle: each play gets a fresh question order.
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export default function AwsQuiz() {
  const [questionOrder, setQuestionOrder] = useState(() => shuffleQuestions());
  const [isStarting, setIsStarting] = useState(true);
  const [hasRestored, setHasRestored] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [creditError, setCreditError] = useState("");
  const chargedAttemptRef = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [attemptId, setAttemptId] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(10);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreProgress() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;

        if (!user) {
          setCreditError("Please log in before playing.");
          setIsStarting(false);
          setHasRestored(true);
          return;
        }

        setActiveUserId(user.id);
        const storageKey = `gxc-aws-quiz-progress:${user.id}`;
        const raw = window.localStorage.getItem(storageKey);

        if (raw) {
          try {
            const saved = JSON.parse(raw);
            const validOrder = Array.isArray(saved.questionOrder)
              && saved.questionOrder.length === QUESTIONS.length
              && saved.questionOrder.every((index: unknown) =>
                Number.isInteger(index) && Number(index) >= 0 && Number(index) < QUESTIONS.length
              )
              && new Set(saved.questionOrder).size === QUESTIONS.length;

            if (saved.version === 1 && validOrder && saved.creditCharged === true) {
              setQuestionOrder(saved.questionOrder.map((index: number) => QUESTIONS[index]));
              setCurrent(Math.min(Math.max(Number(saved.current) || 0, 0), QUESTIONS.length - 1));
              setSelected(saved.selected === null || Number.isInteger(saved.selected) ? saved.selected : null);
              setScore(Math.max(0, Math.min(Number(saved.score) || 0, QUESTIONS.length)));
              setFinished(saved.finished === true);
              setTimedOut(saved.timedOut === true);
              setRemainingSeconds(Math.max(0, Math.min(Number(saved.remainingSeconds) || 0, 20)));
              setSaved(saved.saved === true);
              setSaveMessage(typeof saved.saveMessage === "string" ? saved.saveMessage : "");
              setAttemptId(Math.max(0, Number(saved.attemptId) || 0));
              chargedAttemptRef.current = Math.max(0, Number(saved.attemptId) || 0);
            }
          } catch (parseError) {
            console.warn("Could not restore saved AWS quiz progress:", parseError);
          }
        }
      } catch (restoreError) {
        console.error("Could not check AWS quiz progress:", restoreError);
      } finally {
        if (!cancelled) setHasRestored(true);
      }
    }

    restoreProgress();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasRestored || !activeUserId || creditError) return;

    const storageKey = `gxc-aws-quiz-progress:${activeUserId}`;
    const order = questionOrder.map((item) =>
      QUESTIONS.findIndex((candidate) => candidate.question === item.question)
    );

    try {
      window.localStorage.setItem(storageKey, JSON.stringify({
        version: 1,
        questionOrder: order,
        current,
        selected,
        score,
        finished,
        timedOut,
        remainingSeconds,
        saved,
        saveMessage,
        attemptId,
        creditCharged: chargedAttemptRef.current === attemptId,
      }));
    } catch (storageError) {
      console.warn("Could not save AWS quiz progress locally:", storageError);
    }
  }, [hasRestored, activeUserId, questionOrder, current, selected, score, finished, timedOut, remainingSeconds, saved, saveMessage, attemptId, creditError]);

  useEffect(() => {
    // Charge once per quiz attempt, including Play Again. The ref prevents
    // React Strict Mode's development effect replay from charging twice.
    if (!hasRestored) return;
    if (chargedAttemptRef.current === attemptId) {
      setIsStarting(false);
      return;
    }
    chargedAttemptRef.current = attemptId;
    let cancelled = false;

    async function startAttempt() {
      setIsStarting(true);
      setCreditError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please log in before playing.");
        }

        const result = await deductGameCredit(user.id);
        if (!result.success) {
          throw new Error(
            result.message || "You don't have enough credits to play."
          );
        }

        if (!cancelled) setIsStarting(false);
      } catch (error) {
        if (!cancelled) {
          setCreditError(
            error instanceof Error
              ? error.message
              : "Couldn't deduct a game credit. Please try again."
          );
          setIsStarting(false);
        }
      }
    }

    startAttempt();
    return () => {
      cancelled = true;
    };
  }, [attemptId, hasRestored]);

  const question = questionOrder[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;
  const accuracy = Math.round((score / QUESTIONS.length) * 100);
  const timeLimit = question.difficulty === "Easy" ? 10 : question.difficulty === "Moderate" ? 15 : 20;

  useEffect(() => {
    if (isStarting || creditError || finished || selected !== null) return;
    setRemainingSeconds(timeLimit);
    setTimedOut(false);
    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [current, finished, selected, attemptId, timeLimit, isStarting, creditError]);

  useEffect(() => {
    if (remainingSeconds === 0 && selected === null && !finished) {
      setTimedOut(true);
      setSelected(-1);
    }
  }, [remainingSeconds, selected, finished]);

  function handleAnswer(index: number) {
    if (selected !== null) return;

    setSelected(index);

    if (index === question.answer) {
      setScore((previous) => previous + 1);
    }
  }

  async function nextQuestion() {
    if (current !== QUESTIONS.length - 1) {
      const nextIndex = current + 1;
      const nextQuestion = questionOrder[nextIndex];
      const nextTimeLimit =
        nextQuestion.difficulty === "Easy"
          ? 10
          : nextQuestion.difficulty === "Moderate"
            ? 15
            : 20;

      // Reset the timer before rendering the next unanswered question.
      // Otherwise the timeout effect can see the previous question's 0s
      // while selected is null and immediately time out the new question.
      setCurrent(nextIndex);
      setSelected(null);
      setTimedOut(false);
      setRemainingSeconds(nextTimeLimit);
      return;
    }

    // Calculate the final score without relying on asynchronous state updates.
    const finalScore =
      score + (selected === question.answer ? 1 : 0);

    setScore(finalScore);
    setFinished(true);
    setSaving(true);
    setSaveMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setSaveMessage("Log in to save your score to the leaderboard.");
        return;
      }

      await submitScore(AWS_GAME_ID, user.id, finalScore);

      setSaved(true);
      setSaveMessage("Your score has been saved to AWS Cloud Quest!");
    } catch (error) {
      console.error("AWS quiz score submission failed:", error);
      setSaveMessage(
        "We couldn't save your score. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function restartQuiz() {
    setQuestionOrder(shuffleQuestions());
    chargedAttemptRef.current = null;
    setIsStarting(true);
    setCreditError("");
    setCurrent(0);
    setSelected(null);
    setTimedOut(false);
    setRemainingSeconds(10);
    setScore(0);
    setFinished(false);
    setSaving(false);
    setSaveMessage("");
    setSaved(false);
    setAttemptId((previous) => previous + 1);
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <span className="text-sm font-bold uppercase tracking-[0.3em] text-[#5f2396]">
          GXC Arcade
        </span>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#220849] md:text-5xl">
          AWS Cloud Quest
        </h1>

        <p className="mt-3 text-[#220849]/60">
          Test your AWS knowledge. Prove your skills.
        </p>
      </div>

      {isStarting ? (
        <div className="rounded-3xl border border-[#c7a6f3]/40 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e2d4f8] border-t-[#5f2396]" />
          <p className="mt-4 font-semibold text-[#5f2396]">Checking credits and starting your game...</p>
        </div>
      ) : creditError ? (
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <h2 className="text-2xl font-black text-[#220849]">Unable to start game</h2>
          <p role="alert" className="mt-3 text-red-700">{creditError}</p>
          <p className="mt-2 text-sm text-[#220849]/60">One credit is required for each play. No quiz questions have been started.</p>
          <button
            onClick={restartQuiz}
            className="mt-6 rounded-xl bg-[#5f2396] px-6 py-3 font-bold text-white transition hover:bg-[#220849]"
          >
            Try Again
          </button>
        </div>
      ) : finished ? (
        <motion.div
          key={`result-${attemptId}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#c7a6f3]/40 bg-white p-8 text-center shadow-xl md:p-12"
        >
          <Trophy className="mx-auto h-16 w-16 text-[#5f2396]" />

          <h2 className="mt-5 text-3xl font-black text-[#220849]">
            {accuracy >= 80
              ? "Cloud Champion!"
              : accuracy >= 50
                ? "Good Effort!"
                : "Keep Learning!"}
          </h2>

          <p className="mt-3 text-[#220849]/60">
            You completed the AWS Cloud Quest.
          </p>

          <div className="my-8 rounded-2xl bg-[#f4effc] p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-[#5f2396]">
              Final Score
            </p>

            <p className="mt-2 text-5xl font-black text-[#220849]">
              {score}/{QUESTIONS.length}
            </p>

            <p className="mt-2 font-semibold text-[#5f2396]">
              {accuracy}% accuracy
            </p>
          </div>

          <p
            role="status"
            className={`mb-5 text-sm font-semibold ${
              saved ? "text-green-700" : "text-[#5f2396]"
            }`}
          >
            {saving ? "Saving your score..." : saveMessage}
          </p>

          {!saving && !saved && saveMessage.includes("couldn't") && (
            <button
              onClick={() => {
                setFinished(false);
                setSelected(QUESTIONS.length - 1);
                setCurrent(QUESTIONS.length - 1);
              }}
              className="mb-4 mr-3 rounded-xl border border-[#5f2396] px-5 py-3 font-bold text-[#5f2396]"
            >
              Return to final question
            </button>
          )}

          <button
            onClick={restartQuiz}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5f2396] px-6 py-4 font-bold text-white transition hover:bg-[#220849] disabled:opacity-50"
          >
            <RotateCcw size={18} />
            Play Again
          </button>
        </motion.div>
      ) : (
        <motion.div
          key={`${attemptId}-${current}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#c7a6f3]/40 bg-white p-6 shadow-xl md:p-10"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-[#5f2396]">
              QUESTION {current + 1} / {QUESTIONS.length}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-xs font-black uppercase ${
                question.difficulty === "Easy"
                  ? "bg-green-100 text-green-700"
                  : question.difficulty === "Moderate"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#f4effc]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#5f2396] to-[#c7a6f3]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-[#f4effc] px-4 py-3">
            <span className="text-sm font-bold text-[#5f2396]">Time remaining</span>
            <span role="timer" aria-live="polite" className={`text-lg font-black tabular-nums ${remainingSeconds <= 5 ? "text-red-600" : "text-[#220849]"}`}>
              {remainingSeconds}s / {timeLimit}s
            </span>
          </div>

          <h2 className="mb-8 mt-8 text-xl font-bold leading-relaxed text-[#220849] md:text-2xl">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selected === index;
              const isCorrect = index === question.answer;

              let optionStyle =
                "border-[#c7a6f3]/40 bg-white hover:border-[#5f2396] hover:bg-[#f4effc]";

              if (selected !== null && isCorrect) {
                optionStyle = "border-green-500 bg-green-50 text-green-800";
              } else if (isSelected && !isCorrect) {
                optionStyle = "border-red-500 bg-red-50 text-red-800";
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(index)}
                  disabled={selected !== null}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left font-semibold transition ${optionStyle}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4effc] text-sm font-black text-[#5f2396]">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="flex-1">{option}</span>

                  {selected !== null && selected >= 0 && isCorrect && (
                    <CheckCircle2 className="shrink-0 text-green-600" />
                  )}

                  {isSelected && !isCorrect && (
                    <XCircle className="shrink-0 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 rounded-2xl p-5 ${
                selected === question.answer
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="font-black">
                {timedOut ? "Time’s up!" : selected === question.answer ? "Correct! 🎉" : "Not quite!"}
              </p>

              <p className="mt-2 text-sm leading-relaxed">
                {timedOut ? "You ran out of time for this question. " : ""}{question.explanation}
              </p>
            </motion.div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-[#220849]/60">
              Score: {score}/{current + (selected !== null ? 1 : 0)}
            </p>

            <button
              onClick={nextQuestion}
              disabled={selected === null || saving}
              className="rounded-xl bg-[#5f2396] px-6 py-3 font-bold text-white transition hover:bg-[#220849] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {current === QUESTIONS.length - 1
                ? "See Results"
                : "Next Question →"}
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
}