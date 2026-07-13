import {
  Activity,
  BarChart3,
  Bot,
  Database,
  FileText,
  FlaskConical,
  HeartPulse,
  History,
  ImageUp,
  Leaf,
  Microscope,
  ScanSearch,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Users,
} from "lucide-react";

export const navItems = [
  { label: "Home", path: "/" },
  { label: "Detect Disease", path: "/detect" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Dataset", path: "/dataset" },
  { label: "Analytics", path: "/analytics" },
  { label: "Model", path: "/model" },
  { label: "Assistant", path: "/assistant" },
  { label: "Research", path: "/research" },
  { label: "Contact", path: "/contact" },
];

export const featureCards = [
  { icon: ScanSearch, title: "AI Disease Detection", description: "Deep learning diagnosis for healthy and diseased leaf images." },
  { icon: Microscope, title: "Computer Vision Analysis", description: "Segmentation, enhancement, heatmaps, and affected region overlays." },
  { icon: HeartPulse, title: "Disease Severity Detection", description: "Low, medium, high, and critical severity estimation." },
  { icon: Stethoscope, title: "Treatment Recommendation", description: "Actionable organic, chemical, and preventive treatment guidance." },
  { icon: FileText, title: "PDF Reports", description: "Professional downloadable diagnosis reports for academic and field use." },
  { icon: History, title: "Prediction History", description: "Track scans, reports, timestamps, and crop-specific outcomes." },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Monitor trends, crop distribution, confidence, and disease frequency." },
  { icon: Bot, title: "Plant Assistant AI", description: "Agricultural chatbot with report-aware plant care memory." },
];

export const stats = [
  ["Predictions Made", "12,840"],
  ["Accuracy Rate", "96.4%"],
  ["Active Users", "2,100"],
  ["Supported Crops", "38+"],
  ["Healthy Plants Detected", "7,420"],
  ["Diseased Plants Detected", "5,420"],
  ["Average Confidence Score", "91.8%"],
];

export const supportedCrops = ["Tomato", "Potato", "Corn", "Apple", "Grape", "Pepper", "PlantVillage crops"];

export const cropDataset = [
  {
    crop: "Tomato",
    icon: "T",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    images: 18160,
    percent: 33.4,
    diseases: ["Early Blight", "Late Blight", "Leaf Mold", "Septoria Leaf Spot", "Yellow Leaf Curl Virus"],
    facts: ["Tomato is botanically a berry, even though it is cooked like a vegetable.", "Leaf wetness for only a few hours can strongly increase blight risk.", "Excess nitrogen can make leaves lush but more disease-prone."],
  },
  {
    crop: "Potato",
    icon: "P",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
    images: 2152,
    percent: 4.0,
    diseases: ["Early Blight", "Late Blight", "Healthy"],
    facts: ["Potato and tomato are from the same plant family, so some diseases overlap.", "Late blight can spread quickly in cool, humid weather.", "Tubers exposed to sunlight may turn green and build up bitter compounds."],
  },
  {
    crop: "Corn",
    icon: "C",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    images: 3852,
    percent: 7.1,
    diseases: ["Common Rust", "Gray Leaf Spot", "Northern Leaf Blight"],
    facts: ["Each corn silk connects to one potential kernel on the cob.", "Gray leaf spot survives in crop residue, so field sanitation matters.", "Corn is wind-pollinated, which is why spacing affects yield."],
  },
  {
    crop: "Apple",
    icon: "A",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    images: 3171,
    percent: 5.8,
    diseases: ["Apple Scab", "Black Rot", "Cedar Apple Rust"],
    facts: ["Apple trees often need cross-pollination from compatible varieties.", "Cedar apple rust needs both apple and cedar or juniper hosts.", "Leaf disease can reduce next season's fruit quality by weakening the tree."],
  },
  {
    crop: "Grape",
    icon: "G",
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80",
    images: 4062,
    percent: 7.5,
    diseases: ["Black Rot", "Esca", "Leaf Blight"],
    facts: ["Grape leaves are often the earliest warning system for vine stress.", "Black rot can infect leaves, shoots, and fruit in humid conditions.", "Canopy airflow is one of the strongest vineyard disease-prevention tools."],
  },
  {
    crop: "Pepper",
    icon: "B",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80",
    images: 2475,
    percent: 4.6,
    diseases: ["Bacterial Spot", "Healthy"],
    facts: ["Bell peppers are sweet because they lack the capsaicin heat found in many chilies.", "Bacterial spot spreads easily through splashing water.", "Pepper plants are sensitive to calcium imbalance during fruiting."],
  },
  {
    crop: "Strawberry",
    icon: "S",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
    images: 1565,
    percent: 2.9,
    diseases: ["Leaf Scorch", "Healthy"],
    facts: ["The tiny seeds on a strawberry are actually individual fruits called achenes.", "Leaf scorch can reduce crown strength and weaken future harvests.", "Dense, wet foliage invites fungal pressure in strawberry beds."],
  },
  {
    crop: "Blueberry",
    icon: "BL",
    image: "https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?auto=format&fit=crop&w=900&q=85",
    images: 1502,
    percent: 2.8,
    diseases: ["Healthy"],
    facts: ["Blueberries naturally prefer acidic soil with a pH near 4.5 to 5.5.", "Their pale waxy coating, called bloom, helps protect the fruit.", "Poor drainage can quickly weaken blueberry roots and foliage."],
  },
  {
    crop: "Cherry",
    icon: "CH",
    image: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=900&q=85",
    images: 1906,
    percent: 3.5,
    diseases: ["Powdery Mildew", "Healthy"],
    facts: ["Many sweet cherry varieties need another compatible tree for pollination.", "Cherry leaves can reveal water stress before fruit symptoms appear.", "Open canopies help reduce mildew pressure."],
  },
  {
    crop: "Orange",
    icon: "O",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=900&q=85",
    images: 5507,
    percent: 10.1,
    diseases: ["Citrus Greening"],
    facts: ["Orange fruit can remain green-skinned in warm climates even when ripe.", "Citrus greening is spread by tiny insects called psyllids.", "Uneven yellow mottling across a leaf can be an important citrus warning sign."],
  },
  {
    crop: "Peach",
    icon: "PE",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Peach%20close-up2.jpg?width=900",
    images: 2657,
    percent: 4.9,
    diseases: ["Bacterial Spot", "Healthy"],
    facts: ["Peach fuzz helps protect fruit from moisture and small pests.", "Bacterial spot pressure increases during warm, wet, windy weather.", "Balanced pruning improves airflow around peach leaves and fruit."],
  },
  {
    crop: "Raspberry",
    icon: "R",
    image: "https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?auto=format&fit=crop&w=900&q=85",
    images: 371,
    percent: 0.7,
    diseases: ["Healthy"],
    facts: ["A raspberry is made of many tiny individual fruits called drupelets.", "Old fruiting canes are removed to improve airflow and new growth.", "Wet foliage can encourage cane and leaf diseases."],
  },
  {
    crop: "Soybean",
    icon: "SO",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Closeup%20of%20Soybean%20Pods%20%2810060092536%29.jpg?width=900",
    images: 5090,
    percent: 9.4,
    diseases: ["Healthy"],
    facts: ["Soybean roots partner with bacteria that naturally fix nitrogen.", "Leaf position changes through the day to manage light and water stress.", "Healthy nodules inside soybean roots often appear pink."],
  },
  {
    crop: "Squash",
    icon: "SQ",
    image: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=900&q=85",
    images: 1835,
    percent: 3.4,
    diseases: ["Powdery Mildew"],
    facts: ["Squash plants produce separate male and female flowers.", "Powdery mildew can develop even when leaves are not visibly wet.", "Morning pollination is especially important for good fruit formation."],
  },
  {
    crop: "Other PlantVillage Crops",
    icon: "PV",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80",
    images: 18879,
    percent: 34.7,
    diseases: ["Blueberry", "Cherry", "Orange", "Peach", "Soybean", "Squash"],
    facts: ["PlantVillage includes many crops with visually similar leaf symptoms.", "Healthy-class images help the model learn when not to raise an alarm.", "Mixed crop coverage helps separate crop identity from disease texture."],
  },
];

export const researchSections = [
  { title: "Project Introduction", body: "LeafSense AI is a full-stack plant disease detection system that combines image upload, trained EfficientNet-B3 inference, explainable visual outputs, and recommendation support for crop-health decisions." },
  { title: "Problem Statement", body: "Farmers and students need fast, accessible disease screening from leaf images. Manual inspection is slow, inconsistent, and difficult to scale across common PlantVillage crops." },
  { title: "Research Objectives", body: "The project targets accurate disease classification, confidence reporting, severity estimation, treatment guidance, and clean report generation without retraining the already prepared model." },
  { title: "Methodology", body: "The workflow uses OpenCV preprocessing, a 300 by 300 EfficientNet-B3 input pipeline, Keras model inference, top-class probability extraction, and Gemini-assisted advisory text." },
  { title: "Dataset Collection", body: "Dataset screens summarize supported crops, class distribution, train-validation split, and disease coverage so reviewers can understand model scope and class balance." },
  { title: "Computer Vision Pipeline", body: "Uploaded images are stored, resized, passed to the model, and converted into heatmap and highlighted views to make the result easier to inspect visually." },
  { title: "Model Architecture", body: "The trained Keras model uses an EfficientNet-B3 backbone with a 39-class output head. It is loaded for inference only according to the project requirement." },
  { title: "Performance Metrics", body: "Analytics pages present accuracy, precision, recall, F1 score, class distribution, and scan activity with working filters and export controls for review." },
  { title: "Research Findings", body: "The system demonstrates that a compact web workflow can connect image-based diagnosis, explainability, and crop-care recommendations in a student research platform." },
  { title: "Future Scope", body: "Future work can add field-device capture, production Supabase storage, larger real-world datasets, and richer agronomist-validated recommendation feedback." },
  { title: "Conclusion", body: "LeafSense AI is now structured as a production-ready prototype with separate frontend, FastAPI backend, model inference, analytics, and report workflows." },
  { title: "References", body: "Reference material includes PlantVillage-style datasets, EfficientNet transfer learning literature, OpenCV preprocessing methods, and agricultural disease-management guidance." },
];

export const teamMembers = [
  {
    name: "Samar Sinha",
    role: "Lead Developer and Architect",
    email: "samarsinha2517@gmail.com",
    github: "https://github.com/samarsinha17",
    linkedin: "https://www.linkedin.com/in/samar-sinha",
    bio: "Coder, builder, and AI/ML developer focused on training models, shipping full-stack systems, and turning ideas into working intelligent products.",
  },
  {
    name: "Yash Gupta",
    role: "Data Analyst and Researcher",
    email: "yashgupta220503@gmail.com",
    github: "https://github.com/Yashgupta220503",
    linkedin: "https://www.linkedin.com/in/yashgupta2205",
    bio: "Focuses on dataset analysis, research validation, performance interpretation, and project documentation.",
  },
];

export const projectGuide = {
  name: "Project Guide",
  body: "Name: Dr. Nidhi Agarwal\nDesignation: Professor\nDepartment: Computer Science And Engineering\n\nUnder the expert guidance of Dr. Nidhi Agarwal, our team has developed this innovative AI-powered plant disease detection system.",
};

export const universityInfo = {
  name: "University Information",
  body: "Institution: GALGOTIAS UNIVERSITY\nDepartment: Computer Science & Engineering\nProgram: B.Tech in Computer Science\nSpecialization: AIML\nAcademic Year: 2025-2026\n\nThis project is developed as part of the final year project submission at Galgotias University, demonstrating practical application of AI in agriculture.",
};

export const adminFeatures = [
  { icon: Users, label: "Manage Users" },
  { icon: FileText, label: "Manage Reports" },
  { icon: Database, label: "Manage Datasets" },
  { icon: Activity, label: "Manage Analytics" },
  { icon: ShieldCheck, label: "System Monitoring" },
  { icon: FlaskConical, label: "Manage Models" },
];

export const howItWorks = [
  { icon: ImageUp, title: "Upload Image", detail: "Submit a JPG, PNG, JPEG, or WEBP leaf image." },
  { icon: Leaf, title: "AI Analysis", detail: "Preprocessing, segmentation, and enhancement run first." },
  { icon: ScanSearch, title: "Disease Detection", detail: "EfficientNet-B3 inference predicts crop and disease class." },
  { icon: Sprout, title: "Treatment Recommendation", detail: "Gemini generates structured care guidance." },
  { icon: FileText, title: "Generate Report", detail: "Export PDF, CSV, and email-ready reports." },
];
