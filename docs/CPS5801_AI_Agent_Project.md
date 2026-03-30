# CPS 5801 Advanced AI — Final Project: LLM/VLM-Driven AI Agent

**Department of Computer Science and Technology, Kean University**

---

## Overview

This team project (2 students per team) requires you to design and implement an AI agent driven by a Large Language Model (LLM) or Vision-Language Model (VLM). Unlike traditional deep learning projects that focus only on model training, this project emphasizes **system design, reasoning workflows, tool integration, and systematic evaluation**.

Students will explore three different approaches to building AI systems:

1. Prompt-based LLM/VLM usage
2. Lightweight model fine-tuning
3. Tool-based AI agents

The final goal is to analyze when each approach works well and compare their performance using quantitative evaluation.

---

## Project Phases

### 1. Team Formation — 0 points

Submit a list of team members. Each team must contain exactly 2 students. 1 submission per team.

---

### 2. Project Proposal — 50 points

**Task 1 (Problem Definition and System Design)**

Submit a **1–2 page document** describing:

- The application problem
- The proposed agent system
- The tools or models you plan to use
- The evaluation plan
- Flowchart of the system architecture

> No coding is required for this submission. 1 submission per team.

Students are encouraged to discuss with the instructor about their plans.

---

### 3. Midterm Progress Report — 50 points

At midterm you should complete:

- Task 2 (Baseline LLM/VLM Agent)
- Partial work on Task 3

**Submission:**

- Jupyter Notebook (.ipynb): 1 per team
- Teammate Report: Each team member needs to submit one
- Schedule a meeting with the instructor per team to discuss the progress: [https://kuan-huang.youcanbook.me](https://kuan-huang.youcanbook.me)

> No meeting = zero points.

---

### 4. Final Report — 100 points

You must complete all project tasks and submit:

- Final notebook: 1 per team
- Final report in IEEE conference format: 1 per team
- Teammate Report: Each team member needs to submit one

---

### 5. Final Presentation — 100 points

Each team must submit:

- An 8-minute presentation video: 1 per team
- Presentation slides summarizing the system and results: 1 per team

---

## Timeline

| Deliverable | Due Date | Description | Points |
|-------------|----------|-------------|--------|
| Group List | March 20, 2026 | Submit team members' names | 0 |
| Proposal | **March 31, 2026** | Submit a Word/PDF file | 50 |
| Midterm Report | **April 17, 2026** | Notebook + teammate report | 50 |
| Final Report | **May 6, 2026** | Notebook + written report + teammate report | 100 |
| Presentation | **April 30, 2026** | Slides + 8-minute pre-recorded presentation | 100 |

---

## Task 1: Problem Definition, Agent Architecture, and Evaluation Plan

Students must define the task and design the AI system before implementation.

### Problem Definition

- Application scenario and target users
- Input and output format
- Task type (classification, segmentation, detection, QA, etc.)
- Expected system capabilities and limitations

### Agent Architecture

Students must design a flowchart showing:

- The LLM/VLM component
- Tools or modules
- Reasoning workflow
- Interactions between components

### Evaluation Plan

Students must specify how the system will be evaluated.

**Examples of metrics:**

**Classification tasks:**
- Accuracy
- Precision / Recall
- F1 Score

**Segmentation tasks:**
- IoU
- Dice Score

**Detection tasks:**
- mAP

**QA or reasoning tasks:**
- Answer accuracy
- Task success rate

Students must clearly define:

- Evaluation metrics
- Dataset or benchmark used
- Size of the evaluation set

---

## Task 2: Baseline LLM/VLM Agent

Students must implement a baseline system using a pretrained LLM or VLM.

**Possible approaches:**

- Zero-shot prompting
- Few-shot prompting
- Chain-of-thought prompting
- Prompt engineering strategies
- LLM/VLM + one simple tool

**Students must present:**

- Prompt design
- Example outputs
- Baseline evaluation results
- Discussion of system limitations

---

## Task 3: Advanced Agent Design

Students must extend the baseline system using **two different improvement strategies**.

### Part 1: Lightweight Fine-Tuning

Students perform lightweight model adaptation using methods such as:

- LoRA
- Instruction tuning
- Adapter tuning
- Prompt tuning

**Students must describe:**

- Dataset used for tuning
- Training setup
- Improvement compared to baseline

### Part 2: Tool-Based Agent

Students must build an agent that integrates external tools.

**Examples of tools:**

- Retrieval systems (RAG)
- Image classification models
- Segmentation models
- OCR systems
- External APIs
- Planning modules

The agent should demonstrate **multi-step reasoning** and interaction between modules.

---

## Task 4: Evaluation and Ablation Study

Students must compare **three approaches**:

1. Baseline LLM/VLM system (Task 2)
2. Fine-tuned LLM/VLM system (Task 3 Part 1)
3. Tool-based AI agent (Task 3 Part 2)

Evaluation must include **quantitative comparison**.

**Example evaluation table:**

| Method | Accuracy | F1 Score | Task Success Rate |
|--------|----------|----------|-------------------|
| Baseline LLM/VLM | | | |
| Fine-tuned LLM/VLM | | | |
| Tool-based Agent | | | |

**Ablation experiments** should analyze the contribution of system components.

Examples:
- Removing retrieval module
- Removing reasoning strategy
- Removing image analysis module

---

## Report Requirements

The final report must follow **IEEE conference paper format** (LaTeX or Word).

Template: [https://www.ieee.org/conferences/publishing/templates](https://www.ieee.org/conferences/publishing/templates)

**Required sections:**

1. Introduction
2. Related Work
3. System Architecture
4. Baseline LLM/VLM Agent
5. Improved Systems
6. Evaluation and Ablation Study
7. Discussion and Conclusions

> Figures and tables must be clearly labeled and referenced. Poor organization or unclear figures may result in point deductions.

---

## Teammate Contribution Report

Each student must submit a short teammate report describing the contribution of each member. You may submit the teammate report as a separate document, or include it directly in the Canvas comment section when submitting the assignment.

**Example:**

> "Student A designed the system architecture and implemented the baseline model. Student B implemented the fine-tuning and evaluation experiments. Contribution breakdown: Student A – 50%, Student B – 50%."

---

## Presentation

Each group must submit a **pre-recorded presentation video (8 minutes max)** along with presentation slides to Canvas.
