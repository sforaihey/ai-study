window.AI_LESSONS = [
  {
    "level": "AI Universe",
    "title": "AI vs Automation",
    "minutes": 5,
    "concept": "Automation follows predefined rules. AI handles tasks involving pattern recognition, prediction, perception, generation, or decisions under uncertainty. A workflow can be automated without being AI.",
    "example": "A rule sends every invoice above $10,000 for approval. That is automation. A model that scores each invoice for fraud using many signals is AI.",
    "question": "Which example is automation rather than AI?",
    "options": [
      "A fixed rule routes invoices over a threshold",
      "A model predicts customer churn",
      "A vision model detects damaged products",
      "A model generates product descriptions"
    ],
    "answer": 0
  },
  {
    "level": "AI Universe",
    "title": "AI, ML, Deep Learning & GenAI",
    "minutes": 5,
    "concept": "AI is the broad field. Machine learning is an AI approach that learns patterns from data. Deep learning is ML using multi-layer neural networks. Generative AI creates new content such as text, images, audio, video, or code.",
    "example": "A recommendation model is usually ML. An LLM writing a summary is Generative AI, typically powered by deep learning.",
    "question": "Which relationship is most accurate?",
    "options": [
      "Deep learning is a subset of machine learning",
      "Machine learning is a subset of deep learning",
      "Generative AI includes every form of AI",
      "Automation and AI mean the same thing"
    ],
    "answer": 0
  },
  {
    "level": "AI Universe",
    "title": "Predictive vs Generative AI",
    "minutes": 5,
    "concept": "Predictive AI estimates an outcome, class, score, or future value. Generative AI produces new content. One product can combine both.",
    "example": "Predicting whether a parcel will arrive late is predictive. Writing a personalized apology for the delay is generative.",
    "question": "Forecasting next month’s electricity demand is mainly what?",
    "options": [
      "Predictive AI",
      "Generative AI",
      "Rule-only automation",
      "Robotics"
    ],
    "answer": 0
  },
  {
    "level": "AI Universe",
    "title": "Major AI Workloads",
    "minutes": 5,
    "concept": "AI appears in many forms: natural language processing, computer vision, speech, recommendation systems, forecasting, robotics, and multimodal systems that combine several input types.",
    "example": "A cooking assistant can use computer vision to identify ingredients, an LLM to understand the request, and a recommender to suggest recipes.",
    "question": "Which workload focuses primarily on understanding images and video?",
    "options": [
      "Computer vision",
      "Speech recognition",
      "Regression",
      "Rule automation"
    ],
    "answer": 0
  },
  {
    "level": "How Machines Learn",
    "title": "Data, Features & Labels",
    "minutes": 5,
    "concept": "Data is the raw material. Features are input signals a model uses. A label is the known target used in supervised learning. Poor or biased data can teach the wrong patterns.",
    "example": "For churn prediction, recent usage and support contacts may be features; whether the customer actually churned is the historical label.",
    "question": "In a spam model, which is most likely the label?",
    "options": [
      "Spam or not spam",
      "Message length",
      "Sender domain",
      "Number of links"
    ],
    "answer": 0
  },
  {
    "level": "How Machines Learn",
    "title": "Three Ways Machines Learn",
    "minutes": 5,
    "concept": "Supervised learning uses labeled examples. Unsupervised learning discovers structure without predefined labels. Reinforcement learning learns behavior from rewards and penalties.",
    "example": "Classifying images is supervised; discovering shopper clusters is unsupervised; training a game-playing agent with rewards is reinforcement learning.",
    "question": "Discovering natural groups in unlabeled customer behavior is usually what?",
    "options": [
      "Unsupervised learning",
      "Supervised learning",
      "Reinforcement learning",
      "Rule-based automation"
    ],
    "answer": 0
  },
  {
    "level": "How Machines Learn",
    "title": "Classification, Regression & Clustering",
    "minutes": 5,
    "concept": "Classification predicts categories. Regression predicts continuous numeric values. Clustering groups similar examples without predefined categories.",
    "example": "Fraud/not fraud is classification; predicting a house price is regression; discovering listener segments is clustering.",
    "question": "Predicting delivery time in minutes is usually what?",
    "options": [
      "Regression",
      "Classification",
      "Clustering",
      "Image generation"
    ],
    "answer": 0
  },
  {
    "level": "How Machines Learn",
    "title": "Train, Validate & Test",
    "minutes": 5,
    "concept": "Training data teaches the model. Validation data helps tune choices during development. Test data is held back to estimate performance on unseen examples.",
    "example": "If you repeatedly tune a model against the test set, the test set stops being a clean final check.",
    "question": "Which split should ideally stay untouched until final evaluation?",
    "options": [
      "Test data",
      "Training data",
      "Production data",
      "The feature list"
    ],
    "answer": 0
  },
  {
    "level": "How Machines Learn",
    "title": "Overfitting & Generalization",
    "minutes": 5,
    "concept": "Overfitting means learning the training examples too specifically. Generalization means performing well on new data. Accuracy alone can mislead.",
    "example": "A student who memorizes practice answers but fails reworded questions behaves like an overfit model.",
    "question": "A model scores 99% on training data but 62% on new data. What is the likely issue?",
    "options": [
      "Overfitting",
      "Perfect generalization",
      "Tokenization",
      "Reinforcement learning"
    ],
    "answer": 0
  },
  {
    "level": "Inside the Model",
    "title": "Neural Networks & Parameters",
    "minutes": 5,
    "concept": "A neural network contains layers of connected computations. During training it learns parameters, including weights, that influence how signals are transformed.",
    "example": "In image recognition, early layers may capture edges while deeper layers combine them into more complex visual patterns.",
    "question": "What is a model parameter?",
    "options": [
      "A value learned during training",
      "A user password",
      "A legal requirement",
      "A screen layout"
    ],
    "answer": 0
  },
  {
    "level": "Inside the Model",
    "title": "Loss & Optimization",
    "minutes": 5,
    "concept": "Loss measures how wrong a model is relative to its target. Training repeatedly adjusts parameters to reduce loss. Gradient descent is a common optimization method.",
    "example": "Think of walking downhill in fog: take a small step in the direction that lowers elevation, check again, and repeat.",
    "question": "What is adjusted during model training?",
    "options": [
      "Model parameters",
      "Historical labels after every prediction",
      "The laws of probability",
      "Only the user interface"
    ],
    "answer": 0
  },
  {
    "level": "Inside the Model",
    "title": "Transformers & Attention",
    "minutes": 5,
    "concept": "Transformers are the architecture behind many modern language and multimodal models. Attention helps the model weigh relationships among tokens so surrounding context influences each representation.",
    "example": "In a sentence with an ambiguous pronoun, attention helps the model connect it with the most relevant earlier words.",
    "question": "What is the core purpose of attention?",
    "options": [
      "Weigh relationships among parts of the input",
      "Permanently store every conversation",
      "Replace training data",
      "Guarantee factual truth"
    ],
    "answer": 0
  },
  {
    "level": "Inside the Model",
    "title": "Tokens, Context & Embeddings",
    "minutes": 5,
    "concept": "Language models process tokens. A context window limits how much tokenized information can be considered at once. Embeddings map content into numeric vectors so semantic similarity can be measured.",
    "example": "Two sentences about the same idea can have nearby embeddings even when they use different words.",
    "question": "What are embeddings useful for?",
    "options": [
      "Representing semantic similarity numerically",
      "Making every answer factual",
      "Replacing all databases",
      "Eliminating tokens"
    ],
    "answer": 0
  },
  {
    "level": "Generative AI",
    "title": "Prompting",
    "minutes": 5,
    "concept": "A strong prompt gives a clear task, useful context, constraints, and an expected output format. Prompting improves reliability but cannot fix every model or data limitation.",
    "example": "“Summarize this” is weaker than specifying the audience, length, required points, exclusions, and format.",
    "question": "Which prompt ingredient usually improves reliability?",
    "options": [
      "Clear task, context, constraints and output format",
      "More ambiguity",
      "Removing context",
      "Several unrelated goals at once"
    ],
    "answer": 0
  },
  {
    "level": "Generative AI",
    "title": "RAG",
    "minutes": 5,
    "concept": "Retrieval-augmented generation retrieves relevant external information at run time and places it into the model’s context before generation.",
    "example": "An internal assistant can retrieve the latest policy sections before answering instead of relying only on what the base model learned during training.",
    "question": "What is RAG mainly designed to do?",
    "options": [
      "Bring relevant external information into the model’s context",
      "Retrain the entire model for every question",
      "Increase GPU speed",
      "Remove all hallucinations"
    ],
    "answer": 0
  },
  {
    "level": "Generative AI",
    "title": "Fine-Tuning",
    "minutes": 5,
    "concept": "Fine-tuning changes model behavior by training it further on selected examples. RAG supplies information at run time; fine-tuning changes learned behavior.",
    "example": "Fine-tuning may help a model consistently follow a specialized style or task pattern; it is not automatically the best way to keep facts current.",
    "question": "Fine-tuning primarily does what?",
    "options": [
      "Adjusts model behavior through additional training",
      "Searches a document store at every query",
      "Expands the context window automatically",
      "Guarantees citations"
    ],
    "answer": 0
  },
  {
    "level": "Generative AI",
    "title": "Tools & Agents",
    "minutes": 5,
    "concept": "Tool use lets a model call external functions such as search, calculators, databases, or business APIs. An agent adds a loop that can plan, act, observe results, and continue toward a goal.",
    "example": "A travel agent may search flights, check weather, calculate a budget, and revise the itinerary using several tools.",
    "question": "What most clearly distinguishes an agent from a one-shot model response?",
    "options": [
      "It can iteratively plan, act, observe and continue",
      "It never uses tools",
      "It only generates images",
      "It cannot receive feedback"
    ],
    "answer": 0
  },
  {
    "level": "AI Product Design",
    "title": "Should This Even Be AI?",
    "minutes": 5,
    "concept": "Start with the problem, not the technology. AI is useful when a task involves patterns, uncertainty, language, perception, prediction, or generation. Stable exact logic may be better handled by ordinary software.",
    "example": "If tax is always calculated by a fixed formula, normal software is usually better than AI.",
    "question": "What is the best first question in an AI product idea?",
    "options": [
      "What problem are we solving and does it need AI?",
      "Which model has the most parameters?",
      "How can we add a chatbot?",
      "Which vendor has the best logo?"
    ],
    "answer": 0
  },
  {
    "level": "AI Product Design",
    "title": "Build vs Buy & Model Selection",
    "minutes": 5,
    "concept": "Choosing an AI solution involves capability, data sensitivity, cost, latency, integration effort, control, customization, and vendor risk. The biggest model is not automatically best.",
    "example": "A small specialized model can outperform a huge general model for a narrow task while costing less and responding faster.",
    "question": "Which factor belongs in model selection?",
    "options": [
      "Capability, cost, latency, control and risk",
      "Parameter count only",
      "Brand popularity only",
      "Newest release date only"
    ],
    "answer": 0
  },
  {
    "level": "AI Product Design",
    "title": "Evaluation & Human Review",
    "minutes": 5,
    "concept": "Evaluate AI against the real use case. Quality can include accuracy, groundedness, safety, bias, latency, cost, and user outcomes. Human review matters more as consequences rise.",
    "example": "A creative writing assistant and a clinical decision-support system should not have the same tolerance for factual errors.",
    "question": "Why should AI evaluation be use-case specific?",
    "options": [
      "Different uses have different quality and risk requirements",
      "Every AI task has one universal metric",
      "Only model size matters",
      "Safety is unrelated to context"
    ],
    "answer": 0
  },
  {
    "level": "AI Product Design",
    "title": "Quality, Cost & Latency",
    "minutes": 5,
    "concept": "AI product design often involves tradeoffs: larger or more complex models may improve quality but increase cost and latency.",
    "example": "A real-time voice assistant may prefer a slightly less capable model if it responds much faster.",
    "question": "What is a common AI product tradeoff?",
    "options": [
      "Quality, cost and latency",
      "Screen color, logo and font",
      "Only storage size",
      "Only employee count"
    ],
    "answer": 0
  },
  {
    "level": "Deployment & Operations",
    "title": "Cloud, On-Prem, Edge & APIs",
    "minutes": 5,
    "concept": "Models can be accessed through APIs or hosted in cloud, on-premises, or at the edge. The choice affects privacy, latency, cost, scalability, and control.",
    "example": "An industrial vision model may run at the edge near a factory camera to reduce latency and network dependency.",
    "question": "Why might a team deploy AI at the edge?",
    "options": [
      "Lower latency and local processing",
      "To guarantee perfect accuracy",
      "To avoid all hardware",
      "To eliminate monitoring"
    ],
    "answer": 0
  },
  {
    "level": "Deployment & Operations",
    "title": "MLOps & LLMOps",
    "minutes": 5,
    "concept": "MLOps/LLMOps are practices for reliably developing, deploying, versioning, evaluating, monitoring, and updating AI systems.",
    "example": "Teams track model versions, prompts, datasets, evaluations, incidents, and deployment changes so behavior can be reproduced and managed.",
    "question": "What is the core idea of MLOps/LLMOps?",
    "options": [
      "Manage the AI lifecycle reliably in production",
      "Train a model once and never touch it",
      "Only design user interfaces",
      "Remove the need for testing"
    ],
    "answer": 0
  },
  {
    "level": "Deployment & Operations",
    "title": "Drift & Monitoring",
    "minutes": 5,
    "concept": "Production conditions change. Data drift means the input distribution changes; model performance drift means outcomes degrade. Monitoring detects when assumptions stop holding.",
    "example": "A demand model trained before a major market shift may see new behavior unlike its training data.",
    "question": "What does data drift mean?",
    "options": [
      "The distribution of input data changes over time",
      "The model gains more parameters by itself",
      "The UI changes color",
      "The server restarts"
    ],
    "answer": 0
  },
  {
    "level": "Deployment & Operations",
    "title": "AI Security",
    "minutes": 5,
    "concept": "AI systems can be attacked through prompt injection, poisoned data, model theft, malicious files, insecure tools, or excessive permissions.",
    "example": "An agent with powerful tools should receive only the permissions it needs, because manipulated input could otherwise trigger harmful actions.",
    "question": "Why is least-privilege access important for AI agents?",
    "options": [
      "It limits damage if the agent or input is compromised",
      "It makes the model more creative",
      "It guarantees zero incidents",
      "It removes the need for authentication"
    ],
    "answer": 0
  },
  {
    "level": "Responsible AI",
    "title": "Bias, Fairness & Explainability",
    "minutes": 5,
    "concept": "AI can reproduce or amplify unfair patterns from data, labels, objectives, or deployment choices. Fairness depends on context. Explainability helps people understand relevant factors and limitations.",
    "example": "A hiring model can learn historical discrimination even if nobody explicitly writes a discriminatory rule.",
    "question": "Where can AI bias come from?",
    "options": [
      "Data, labels, objectives and deployment choices",
      "Only malicious programmers",
      "Only model size",
      "Only hardware failures"
    ],
    "answer": 0
  },
  {
    "level": "Responsible AI",
    "title": "Hallucinations, Privacy & IP",
    "minutes": 5,
    "concept": "Generative models can produce plausible but unsupported claims. AI systems can also expose sensitive data or create copyright and ownership questions.",
    "example": "A brainstorming assistant can tolerate more uncertainty than a system generating legal or medical advice.",
    "question": "What is an AI hallucination?",
    "options": [
      "A plausible-sounding output that is unsupported or false",
      "A hardware fan failure",
      "A guaranteed security breach",
      "A type of clustering"
    ],
    "answer": 0
  },
  {
    "level": "Responsible AI",
    "title": "Guardrails & Red Teaming",
    "minutes": 5,
    "concept": "Guardrails constrain risky inputs, outputs, or actions. Red teaming deliberately probes for failures and abuse. Neither removes all risk.",
    "example": "A team may test whether a support bot can be tricked into leaking hidden instructions or taking actions outside its scope.",
    "question": "What is red teaming in AI?",
    "options": [
      "Actively probing the system for weaknesses and misuse paths",
      "Making the interface red",
      "Training only on positive examples",
      "Removing monitoring"
    ],
    "answer": 0
  },
  {
    "level": "AI Strategy",
    "title": "AI Transformation & Business Value",
    "minutes": 5,
    "concept": "AI strategy connects business goals, data, workflows, people, operating model, economics, risk, and change management. The best opportunities often redesign a workflow rather than bolt AI onto one step.",
    "example": "An AI-native support redesign may rethink routing, knowledge retrieval, agent assistance, self-service, quality review, and analytics together.",
    "question": "What makes an AI strategy stronger?",
    "options": [
      "Linking AI to workflows, economics, people, data and risk",
      "Buying the most tools possible",
      "Using AI in every process",
      "Ignoring change management"
    ],
    "answer": 0
  },
  {
    "level": "AI Strategy",
    "title": "Capstone: Design an AI-Native Product",
    "minutes": 10,
    "concept": "A strong AI product design connects user problem, data, model choice, tools, evaluation, human oversight, deployment, monitoring, economics, and risk.",
    "example": "Choose any domain—education, travel, media, retail, healthcare, logistics, climate, legal, gaming, government, science, or something else—and design a product from problem to production.",
    "question": "Which is the most complete AI product design approach?",
    "options": [
      "Problem → data → model/tools → evaluation → deployment → monitoring → improvement",
      "Model → launch",
      "Prompt → logo → launch",
      "Vendor → contract → done"
    ],
    "answer": 0
  }
];