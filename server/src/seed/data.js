// Demo data. Question format: [text, marks, topic]

const U = "VNSGU";
const MCA = "MCA";

const users = {
  admin: { name: "Admin", email: "admin@pyqhub.com", password: "Admin@123", role: "admin", college: U },
  student: { name: "Demo Student", email: "student@pyqhub.com", password: "Student@123", college: U },
};

const subjects = [
  { university: U, course: MCA, semester: 1, name: "Python Programming", code: "101" },
  { university: U, course: MCA, semester: 1, name: "Database Management Systems", code: "102" },
  { university: U, course: MCA, semester: 2, name: "Data Structures", code: "201" },
  { university: U, course: MCA, semester: 2, name: "Software Engineering", code: "202" },
  { university: U, course: MCA, semester: 3, name: "Machine Learning", code: "301" },
  { university: U, course: MCA, semester: 3, name: "Design Patterns", code: "302" },
  { university: U, course: MCA, semester: 3, name: "Advanced Java", code: "303" },
  { university: U, course: MCA, semester: 3, name: "Full Stack Development", code: "304" },
  { university: U, course: MCA, semester: 3, name: "Open Source Web Development", code: "305" },
  { university: U, course: "BCA", semester: 5, name: "Web Development using PHP", code: "501" },
  { university: U, course: "BCA", semester: 5, name: "Computer Networks", code: "502" },
];

const DP = "Design Patterns";
const ML = "Machine Learning";
const AJ = "Advanced Java";
const FS = "Full Stack Development";
const DS = "Data Structures";
const DB = "Database Management Systems";

const papers = [
  // ---------- Design Patterns ----------
  {
    subject: DP, year: 2022, examType: "internal",
    questions: [
      ["What is a design pattern? Explain the elements of a design pattern.", 5, "Introduction"],
      ["Explain Singleton design pattern with example.", 5, "Creational"],
      ["Explain Observer pattern with its structure.", 5, "Behavioral"],
      ["Differentiate between Factory Method and Abstract Factory.", 5, "Creational"],
    ],
  },
  {
    subject: DP, year: 2022, month: "Nov", examType: "external",
    questions: [
      ["Define design pattern. Describe the elements of a design pattern.", 7, "Introduction"],
      ["Explain Abstract Factory pattern with class diagram.", 7, "Creational"],
      ["Explain Adapter pattern with suitable example.", 7, "Structural"],
      ["Write a short note on MVC architecture.", 7, "Introduction"],
      ["Explain Strategy pattern with example.", 7, "Behavioral"],
    ],
  },
  {
    subject: DP, year: 2023, month: "Nov", examType: "external",
    questions: [
      ["Explain Singleton pattern with suitable example.", 7, "Creational"],
      ["What is Observer design pattern? Explain with example.", 7, "Behavioral"],
      ["Explain Decorator pattern with structure and example.", 7, "Structural"],
      ["Explain the Builder pattern.", 7, "Creational"],
      ["Explain how design patterns solve design problems.", 7, "Introduction"],
    ],
  },
  {
    subject: DP, year: 2024, month: "Nov", examType: "external",
    questions: [
      ["Explain elements of design pattern in detail.", 7, "Introduction"],
      ["Explain Singleton design pattern. How is it implemented in Java?", 7, "Creational"],
      ["Explain Adapter pattern with class diagram.", 7, "Structural"],
      ["Explain Strategy design pattern with suitable example.", 7, "Behavioral"],
      ["Explain Facade pattern with example.", 7, "Structural"],
      ["Write a note on MVC architecture.", 7, "Introduction"],
    ],
  },
  {
    subject: DP, year: 2025, examType: "internal",
    questions: [
      ["Explain Observer pattern with example.", 5, "Behavioral"],
      ["Explain Decorator design pattern.", 5, "Structural"],
      ["Explain Abstract Factory design pattern with example.", 5, "Creational"],
      ["Explain the Proxy pattern.", 5, "Structural"],
    ],
  },

  // ---------- Machine Learning ----------
  {
    subject: ML, year: 2023, month: "Nov", examType: "external",
    questions: [
      ["What is machine learning? Explain types of machine learning.", 7, "Introduction"],
      ["Explain linear regression with example.", 7, "Regression"],
      ["Explain KNN algorithm with example.", 7, "Classification"],
      ["Explain overfitting and underfitting.", 7, "Model Evaluation"],
      ["Explain confusion matrix with example.", 7, "Model Evaluation"],
    ],
  },
  {
    subject: ML, year: 2024, month: "Nov", examType: "external",
    questions: [
      ["Explain the types of machine learning with examples.", 7, "Introduction"],
      ["Explain gradient descent algorithm.", 7, "Optimization"],
      ["Explain K-Nearest Neighbour (KNN) algorithm.", 7, "Classification"],
      ["Explain logistic regression.", 7, "Classification"],
      ["What is overfitting and underfitting? How to avoid them?", 7, "Model Evaluation"],
      ["Explain decision tree with example.", 7, "Classification"],
    ],
  },
  {
    subject: ML, year: 2025, examType: "internal",
    questions: [
      ["Explain linear regression.", 5, "Regression"],
      ["Explain gradient descent with diagram.", 5, "Optimization"],
      ["Explain confusion matrix, precision and recall.", 5, "Model Evaluation"],
      ["Explain logistic regression with example.", 5, "Classification"],
    ],
  },

  // ---------- Advanced Java ----------
  {
    subject: AJ, year: 2023, month: "Nov", examType: "external",
    questions: [
      ["Explain JDBC architecture.", 7, "JDBC"],
      ["Explain servlet life cycle.", 7, "Servlet"],
      ["Explain JSP implicit objects.", 7, "JSP"],
      ["Differentiate between Statement and PreparedStatement.", 7, "JDBC"],
      ["Explain session tracking techniques in servlet.", 7, "Servlet"],
    ],
  },
  {
    subject: AJ, year: 2024, month: "Nov", examType: "external",
    questions: [
      ["Explain the architecture of JDBC with diagram.", 7, "JDBC"],
      ["Explain life cycle of servlet.", 7, "Servlet"],
      ["Explain implicit objects of JSP.", 7, "JSP"],
      ["Explain JSP directives.", 7, "JSP"],
      ["Explain cookies and HttpSession for session tracking.", 7, "Servlet"],
    ],
  },

  // ---------- Full Stack ----------
  {
    subject: FS, year: 2024, month: "Nov", examType: "external",
    questions: [
      ["What is React? Explain virtual DOM.", 7, "React"],
      ["Explain useState and useEffect hooks.", 7, "React"],
      ["Explain middleware in Express.js.", 7, "Express"],
      ["Explain CRUD operations in MongoDB.", 7, "MongoDB"],
      ["Explain event loop in Node.js.", 7, "Node"],
    ],
  },
  {
    subject: FS, year: 2025, examType: "internal",
    questions: [
      ["Explain virtual DOM in React.", 5, "React"],
      ["Explain useEffect hook with example.", 5, "React"],
      ["What is middleware in Express? Explain types of middleware.", 5, "Express"],
      ["Explain Node.js event loop.", 5, "Node"],
    ],
  },

  // ---------- Older semesters ----------
  {
    subject: DS, year: 2024, month: "May", examType: "external",
    questions: [
      ["Explain stack and its applications.", 7, "Stack"],
      ["Write an algorithm for binary search.", 7, "Searching"],
      ["Explain tree traversal techniques.", 7, "Tree"],
      ["Explain quick sort with example.", 7, "Sorting"],
    ],
  },
  {
    subject: DB, year: 2024, month: "Jan", examType: "external",
    questions: [
      ["Explain normalization with 1NF, 2NF and 3NF.", 7, "Normalization"],
      ["Explain ACID properties of transaction.", 7, "Transactions"],
      ["Explain ER diagram with example.", 7, "ER Model"],
    ],
  },

  // ---------- For admin panel demo ----------
  {
    subject: DP, year: 2025, month: "Nov", examType: "external", status: "pending", byStudent: true,
    questions: [
      ["Explain Command pattern with example.", 7, "Behavioral"],
      ["Explain Singleton pattern and its thread safety.", 7, "Creational"],
      ["Explain Composite pattern.", 7, "Structural"],
    ],
  },
  {
    subject: ML, year: 2022, examType: "internal", status: "pending", byStudent: true,
    questions: [
      ["Explain supervised and unsupervised learning.", 5, "Introduction"],
      ["Explain Naive Bayes classifier.", 5, "Classification"],
    ],
  },
  {
    subject: AJ, year: 2022, examType: "internal", status: "rejected", byStudent: true,
    rejectReason: "Questions are incomplete, please upload the full paper.",
    questions: [["Explain JDBC.", 5, "JDBC"]],
  },
];

module.exports = { users, subjects, papers };
