const translations = {
    fr: {
      welcome: "Bienvenue sur D&A QUIZ",
      startQuiz: "Commencer",
      login: "Se connecter",
      register: "S'inscrire",
      forTeachers: "Pour les Enseignants",
      t1: "✓ Créez des examens personnalisés",
      t2: "✓ Types de questions variés",
      t3: "✓ Définissez des limites de temps",
      t4: "✓ Suivez les résultats",
      forStudents: "Pour les Étudiants",
      s1: "✓ Passez des examens en ligne",
      s2: "✓ Recevez des commentaires en temps réel",
      s3: "✓ Consultez instantanément vos résultats",
      s4: "✓ Suivez votre progression",
      createAccount: "Créer un compte",
      noAccount: "Vous n'avez pas de compte ? Inscrivez-vous",
      alreadyAccount: "Vous avez déjà un compte ? Se connecter",
      information: "Votre plateforme complète d'examen en ligne pour les enseignants et les étudiants"
    },
    en: {
      welcome: "Welcome to D&A QUIZ",
      startQuiz: "Start",
      login: "Login",
      register: "Register",
      forTeachers: "For Teachers",
      t1: "✓ Create custom exams",
      t2: "✓ Various question types",
      t3: "✓ Set time limits",
      t4: "✓ Track results",
      forStudents: "For Students",
      s1: "✓ Take exams online",
      s2: "✓ Get real-time feedback",
      s3: "✓ See your results instantly",
      s4: "✓ Track your progress",
      createAccount: "Create Account",
      noAccount: "Don't have an account? Sign up",
      alreadyAccount: "Already have an account? Login",
      information: "Your complete online exam platform for teachers and students."
    },
  };
  
  // Fonction qui met à jour les textes selon la langue sélectionnée
  function updateLanguage(lang) {
    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.getAttribute("data-key");
      if (translations[lang] && translations[lang][key]) {
        el.innerText = translations[lang][key];
      }
    });
  }
  
  // Quand la langue est changée
  document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("languageSelect");
  
    // Définir langue par défaut
    updateLanguage(selector.value);
  
    selector.addEventListener("change", () => {
      const selectedLang = selector.value;
      updateLanguage(selectedLang);
    });
  });
  
  