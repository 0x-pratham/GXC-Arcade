"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { submitScore } from "@/lib/actions";

const AWS_GAME_ID = "796aac6a-6cd4-48c6-af90-518bab836a84";

const QUESTIONS = [
  {
    difficulty: "Easy",
    question: "Which AWS service provides scalable object storage?",
    options: ["Amazon EBS", "Amazon S3", "Amazon EC2", "Amazon RDS"],
    answer: 1,
    explanation: "Amazon S3 is an object storage service designed to store and retrieve data at scale.",
  },
  {
    difficulty: "Easy",
    question: "Which AWS service provides virtual servers?",
    options: ["AWS Lambda", "Amazon DynamoDB", "Amazon EC2", "Amazon CloudFront"],
    answer: 2,
    explanation: "Amazon EC2 provides resizable virtual computing capacity in the cloud.",
  },
  {
    difficulty: "Easy",
    question: "What does IAM help you manage?",
    options: [
      "User identities and permissions",
      "Database backups only",
      "Website animations",
      "Physical data centres",
    ],
    answer: 0,
    explanation: "AWS Identity and Access Management controls who can access AWS resources and what actions they can perform.",
  },
  {
    difficulty: "Moderate",
    question: "An application needs to run code in response to events without managing servers. Which service is most suitable?",
    options: ["Amazon EC2", "Amazon EBS", "AWS Lambda", "Amazon Redshift"],
    answer: 2,
    explanation: "AWS Lambda runs code in response to events without requiring you to manage the underlying servers.",
  },
  {
    difficulty: "Moderate",
    question: "Which AWS storage service is designed for block storage attached to EC2 instances?",
    options: ["Amazon S3", "Amazon EBS", "Amazon Glacier", "Amazon EFS"],
    answer: 1,
    explanation: "Amazon EBS provides persistent block storage volumes for use with EC2 instances.",
  },
  {
    difficulty: "Moderate",
    question: "A company wants a managed relational database service. Which AWS service should it consider?",
    options: ["Amazon DynamoDB", "Amazon S3", "Amazon RDS", "Amazon CloudFront"],
    answer: 2,
    explanation: "Amazon RDS simplifies setting up, operating, and scaling relational databases.",
  },
  {
    difficulty: "Moderate",
    question: "Which service distributes content to users through a global network of edge locations?",
    options: ["Amazon VPC", "AWS IAM", "Amazon CloudFront", "Amazon EBS"],
    answer: 2,
    explanation: "Amazon CloudFront is a content delivery network that caches and delivers content through edge locations.",
  },
  {
    difficulty: "Moderate",
    question: "What is the primary purpose of an Auto Scaling group?",
    options: [
      "Encrypt database records",
      "Adjust compute capacity based on demand",
      "Manage DNS records",
      "Create IAM policies",
    ],
    answer: 1,
    explanation: "Auto Scaling can add or remove compute capacity as demand changes.",
  },
  {
    difficulty: "Moderate",
    question: "Which AWS service records account activity and API events for auditing?",
    options: ["Amazon CloudWatch", "AWS CloudTrail", "Amazon Route 53", "AWS Elastic Beanstalk"],
    answer: 1,
    explanation: "AWS CloudTrail records AWS account activity, including API calls, for auditing and investigation.",
  },
  {
    difficulty: "Moderate",
    question: "Which AWS service is primarily used to create isolated virtual networks?",
    options: ["Amazon VPC", "Amazon S3", "AWS Lambda", "Amazon Rekognition"],
    answer: 0,
    explanation: "Amazon VPC lets you provision a logically isolated virtual network in AWS.",
  },
  {
    difficulty: "Moderate",
    question: "Which pricing option can provide discounted pricing in exchange for a commitment to a consistent usage level?",
    options: ["On-Demand", "Spot Instances", "Savings Plans", "Free Tier"],
    answer: 2,
    explanation: "Savings Plans offer lower prices in exchange for a commitment to a specified amount of eligible usage over a term.",
  },
  {
    difficulty: "Moderate",
    question: "Under the AWS shared responsibility model, who is generally responsible for configuring IAM permissions?",
    options: ["AWS exclusively", "The customer", "The internet service provider", "The hardware manufacturer"],
    answer: 1,
    explanation: "Customers are responsible for managing their identities, permissions, and access configuration.",
  },
  {
    difficulty: "Hard",
    question: "An application experiences unpredictable traffic spikes. Which combination can help distribute incoming requests and adjust the number of EC2 instances?",
    options: ["CloudTrail and EBS", "Load Balancer and Auto Scaling", "Route 53 and Glacier only", "IAM and KMS"],
    answer: 1,
    explanation: "A load balancer distributes incoming traffic, while Auto Scaling adjusts compute capacity according to configured policies.",
  },
  {
    difficulty: "Hard",
    question: "A workload needs a managed NoSQL database with key-value data access. Which service is the best fit?",
    options: ["Amazon RDS", "Amazon Redshift", "Amazon DynamoDB", "Amazon EFS"],
    answer: 2,
    explanation: "Amazon DynamoDB is a managed NoSQL database that supports key-value and document data models.",
  },
  {
    difficulty: "Hard",
    question: "Which AWS service is designed for data warehousing and analytical queries?",
    options: ["Amazon Redshift", "Amazon EBS", "AWS IAM", "Amazon Route 53"],
    answer: 0,
    explanation: "Amazon Redshift is a data warehousing service designed for analytics across large datasets.",
  },
  {
    difficulty: "Hard",
    question: "A team wants to define and provision AWS infrastructure using templates. Which service is appropriate?",
    options: ["AWS CloudTrail", "AWS CloudFormation", "Amazon Polly", "Amazon Transcribe"],
    answer: 1,
    explanation: "AWS CloudFormation provisions and manages infrastructure using declarative templates.",
  },
  {
    difficulty: "Hard",
    question: "Which AWS service helps developers build, train, and deploy machine learning models?",
    options: ["Amazon Route 53", "Amazon SageMaker", "Amazon EFS", "AWS Shield"],
    answer: 1,
    explanation: "Amazon SageMaker provides tools and infrastructure for building, training, and deploying machine learning models.",
  },
  {
    difficulty: "Hard",
    question: "A company wants to grant an application temporary access to AWS resources without embedding long-term credentials in its code. Which approach is most appropriate?",
    options: [
      "Hard-code an IAM user's access keys",
      "Disable IAM permissions",
      "Use an IAM role and temporary credentials",
      "Store credentials in a public S3 bucket",
    ],
    answer: 2,
    explanation: "IAM roles provide temporary credentials and help applications access authorized resources without embedding long-term access keys.",
  },
] as const;

export default function AwsQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [attemptId, setAttemptId] = useState(0);

  const question = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;
  const accuracy = Math.round((score / QUESTIONS.length) * 100);

  function handleAnswer(index: number) {
    if (selected !== null) return;

    setSelected(index);

    if (index === question.answer) {
      setScore((previous) => previous + 1);
    }
  }

  async function nextQuestion() {
    if (current !== QUESTIONS.length - 1) {
      setCurrent((previous) => previous + 1);
      setSelected(null);
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
    setCurrent(0);
    setSelected(null);
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

      {finished ? (
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
          key={current}
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

                  {selected !== null && isCorrect && (
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
                {selected === question.answer
                  ? "Correct! 🎉"
                  : "Not quite!"}
              </p>

              <p className="mt-2 text-sm leading-relaxed">
                {question.explanation}
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