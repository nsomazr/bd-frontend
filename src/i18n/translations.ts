export type Lang = "en" | "sw";

export const translations = {
  en: {
    "app.name": "Maisha Chat",
    "app.tagline": "Blood donation assistant",
    "app.sessionLoading": "Checking your session...",

    "nav.features": "Features",
    "nav.how": "How it works",
    "nav.models": "Models",
    "nav.arena": "Arena",
    "nav.faq": "FAQ",
    "nav.signIn": "Sign in",
    "nav.getStarted": "Get started",
    "nav.goToChat": "Go to chat",

    "auth.welcomeBack": "Welcome back",
    "auth.signInSubtitle": "Sign in to pick up where you left off.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signIn": "Sign in",
    "auth.signingIn": "Signing in",
    "auth.newHere": "New here?",
    "auth.createAccount": "Create a free account",
    "auth.createTitle": "Create your account",
    "auth.signupSubtitle": "Just an email and a password. No phone, no forms, no fuss.",
    "auth.signupBadge": "Free forever, takes 10 seconds",
    "auth.passwordHint": "At least 6 characters",
    "auth.passwordShort": "Six characters and you are good to go.",
    "auth.startChatting": "Start chatting",
    "auth.creatingAccount": "Creating your account",
    "auth.alreadyHave": "Already have an account?",
    "auth.disclaimer":
      "By continuing, you agree to use Maisha Chat for educational guidance only. It is not a substitute for medical advice.",

    "theme.toLight": "Switch to light mode",
    "theme.toDark": "Switch to dark mode",

    "lang.en": "EN",
    "lang.sw": "SW",
    "lang.switchToEn": "Switch to English",
    "lang.switchToSw": "Switch to Swahili",

    "sidebar.newChat": "New chat",
    "sidebar.modelArena": "Model Arena",
    "sidebar.leaderboard": "Leaderboard",
    "sidebar.admin": "Admin console",
    "sidebar.recent": "Recent",
    "sidebar.noConversations": "No conversations yet",
    "sidebar.noConversationsHint": "Click New chat to ask Maisha anything.",
    "sidebar.untitled": "Untitled",
    "sidebar.expand": "Expand sidebar",
    "sidebar.collapse": "Collapse sidebar",

    "chat.you": "You",
    "chat.assistant": "Maisha",
    "chat.thinking": "thinking...",
    "chat.emptyTitle": "How can I help today?",
    "chat.emptyBody":
      "Ask anything about blood donation eligibility, the process, recovery, or how to find a centre near you.",
    "chat.copy": "Copy",
    "chat.copied": "Copied",
    "chat.regenerate": "Regenerate",
    "chat.inputPlaceholder": "Message Maisha...",
    "chat.send": "Send",
    "chat.webSearch": "Web search",
    "chat.webSearchHint": "Search the web for up-to-date information before answering",
    "chat.webSearching": "Searching the web...",
    "chat.sources": "Sources",
    "chat.viewSources": "Expand sources",
    "chat.sourcesPanelTitle": "Web sources",
    "chat.closeSources": "Close sources panel",
    "chat.noSourceUrl": "No link available",
    "chat.untitledSource": "Untitled source",
    "chat.loadingModels": "Loading models...",
    "chat.disclaimer":
      "Maisha provides general information and is not a substitute for medical advice.",
    "chat.suggest1": "Am I eligible to donate blood right now?",
    "chat.suggest2": "What should I eat before donating blood?",
    "chat.suggest3": "Where is the nearest blood donation centre?",
    "chat.suggest4": "How long until I can donate again after my last donation?",

    "profile.signOut": "Sign out",
    "profile.switchThemeLight": "Switch to light mode",
    "profile.switchThemeDark": "Switch to dark mode",
    "profile.switchLanguage": "Switch language",

    "landing.heroTitleStart": "Save lives, one",
    "landing.heroTitleHighlight": "conversation",
    "landing.heroTitleEnd": "at a time.",
    "landing.heroBadge": "AI for life-saving donations",
    "landing.heroBodyRest":
      "is your friendly AI companion for everything blood donation in Tanzania: eligibility, the process, recovery, and where to donate near you. Available 24/7 in English and Kiswahili.",
    "landing.ctaContinue": "Continue chatting",
    "landing.ctaStartFree": "Start chatting free",
    "landing.ctaHow": "See how it works",
    "landing.trustFree": "Free forever",
    "landing.trustPrivate": "Private & secure",
    "landing.trustInstant": "Instant streaming answers",
    "landing.mockQuestion": "Am I eligible to donate blood today?",
    "landing.mockAnswerIntro": "Most likely yes! To donate today, you generally need to be:",
    "landing.mockBullet1": "18 - 65 years old",
    "landing.mockBullet2": "At least 50 kg (about 110 lb)",
    "landing.mockBullet3": "Feeling well, with no fever or active infection",
    "landing.mockBullet4": "At least 3 months since your last donation",
    "landing.mockAnswerOutro": "Want me to find the nearest blood bank to confirm?",
    "landing.mockPlaceholder": "Ask Maisha anything...",
    "landing.stat1.value": "1 in 3",
    "landing.stat1.label": "people will need blood in their lifetime",
    "landing.stat2.value": "3 lives",
    "landing.stat2.label": "can be saved by a single donation",
    "landing.stat3.value": "24 / 7",
    "landing.stat3.label": "instant answers in English & Swahili",
    "landing.featuresEyebrow": "What you can ask",
    "landing.featuresTitle": "Everything you need to give blood with confidence.",
    "landing.featuresBody":
      "From your first donation to your hundredth, Maisha is here for every step.",
    "landing.feature1.title": "Check your eligibility",
    "landing.feature1.body":
      "Find out in seconds whether you can donate today based on your age, health, recent travel, medication, and last donation.",
    "landing.feature2.title": "Find a centre near you",
    "landing.feature2.body":
      "Get directions, opening hours, and contact details for blood banks and donation drives across Tanzania.",
    "landing.feature3.title": "Plan your next donation",
    "landing.feature3.body":
      "Track when you can safely donate again and get gentle reminders so you never miss a chance to help.",
    "landing.feature4.title": "Understand the process",
    "landing.feature4.body":
      "Step-by-step walkthroughs of registration, screening, donation, and recovery, with what to expect at each stage.",
    "landing.feature5.title": "Post-donation care",
    "landing.feature5.body":
      "Advice on what to eat, how to recover, and warning signs to watch for, grounded in current best practice.",
    "landing.feature6.title": "Inspire others",
    "landing.feature6.body":
      "Bust the most common myths and learn how to encourage friends and family to donate confidently.",
    "landing.howEyebrow": "How it works",
    "landing.howTitle": "From question to confident decision, in three steps.",
    "landing.step1.title": "Ask anything",
    "landing.step1.body":
      "Type your question in plain English or Swahili. No medical jargon required.",
    "landing.step2.title": "Pick your model",
    "landing.step2.body":
      "Choose from three blood-donation tuned LLMs and switch any time during the conversation.",
    "landing.step3.title": "Get a grounded answer",
    "landing.step3.body":
      "Receive a clear, empathetic response with next steps and trusted recommendations.",
    "landing.modelsEyebrow": "Pick your brain",
    "landing.modelsTitle": "Three blood-donation tuned LLMs, switchable on the fly.",
    "landing.modelsBody":
      "Every model has been fine-tuned on curated blood-donation conversations so you get answers grounded in real-world practice.",
    "landing.model1.tagline": "Google's efficient 4B model",
    "landing.model1.body":
      "Fine-tuned for nuanced, multi-turn blood donation conversations with strong instruction following.",
    "landing.model2.tagline": "Alibaba's multilingual 4B model",
    "landing.model2.body":
      "Excellent at English and Swahili, well-suited for community-facing conversations in East Africa.",
    "landing.model3.tagline": "Meta's lightweight 3B model",
    "landing.model3.body":
      "Fast, low-latency responses for quick eligibility checks and frequently asked questions.",
    "landing.trustEncrypted": "End-to-end encrypted",
    "landing.trustWho": "Aligned with WHO & NBTS guidance",
    "landing.trustBuiltFor": "Built for Tanzania, in English & Swahili",
    "landing.trustAvailable": "Available 24/7",
    "landing.faqEyebrow": "FAQ",
    "landing.faqTitle": "Frequently asked questions",
    "landing.faq1.q": "Is Maisha Chat a substitute for a doctor or blood bank?",
    "landing.faq1.a":
      "No. Maisha provides general guidance to help you understand the donation process and prepare to donate. For medical decisions, always consult a qualified healthcare provider or your nearest blood bank.",
    "landing.faq2.q": "Is my conversation private?",
    "landing.faq2.a":
      "Yes. Your account and chat history are stored securely and are only visible to you. We don't share your data with third parties.",
    "landing.faq3.q": "Which languages does it support?",
    "landing.faq3.a":
      "English and Swahili work well today, with the Qwen model offering the broadest multilingual coverage.",
    "landing.faq4.q": "Is it free to use?",
    "landing.faq4.a":
      "Yes. Maisha Chat is free to use as part of our mission to make blood donation knowledge accessible to everyone in Tanzania.",
    "landing.ctaTitle": "Ready to save lives?",
    "landing.ctaBody":
      "Create your free account and start chatting with Maisha right now. No credit card, no installation.",
    "landing.footerBuilt": "Built with care in Tanzania.",
    "landing.arenaEyebrow": "Model Arena",
    "landing.arenaTitle": "Compare models side by side and vote for the best answer.",
    "landing.arenaBody":
      "Ask one blood-donation question and two anonymous models answer in parallel. Pick the response you trust most. Every vote feeds the live Elo leaderboard so the community can see which model performs best.",
    "landing.arenaStep1.title": "Ask once",
    "landing.arenaStep1.body":
      "Type any eligibility, process, or recovery question in English or Swahili. Both models receive the exact same prompt.",
    "landing.arenaStep2.title": "Compare blind",
    "landing.arenaStep2.body":
      "Read two streaming answers side by side without knowing which model wrote which until you vote.",
    "landing.arenaStep3.title": "Vote & rank",
    "landing.arenaStep3.body":
      "Choose a winner, call a tie, or mark both as weak. Your vote updates public Elo ratings on the live leaderboard.",
    "landing.arenaCtaTry": "Try the arena",
    "landing.arenaCtaLeaderboard": "View live leaderboard",
    "landing.heroTitle": "Save lives, one conversation at a time.",
    "landing.heroBody":
      "Maisha Chat is your friendly AI companion for everything blood donation in Tanzania: eligibility, the process, recovery, and where to donate near you. Available 24/7 in English and Kiswahili.",
    "landing.ctaStart": "Get started for free",
    "landing.ctaChat": "Open the chat",
  },
  sw: {
    "app.name": "Maisha Chat",
    "app.tagline": "Msaidizi wa uchangiaji damu",
    "app.sessionLoading": "Inakagua kikao chako...",

    "nav.features": "Vipengele",
    "nav.how": "Jinsi inavyofanya kazi",
    "nav.models": "Modeli",
    "nav.arena": "Uwanja",
    "nav.faq": "Maswali",
    "nav.signIn": "Ingia",
    "nav.getStarted": "Anza sasa",
    "nav.goToChat": "Fungua mazungumzo",

    "auth.welcomeBack": "Karibu tena",
    "auth.signInSubtitle": "Ingia uendelee ulipoishia.",
    "auth.email": "Barua pepe",
    "auth.password": "Nenosiri",
    "auth.signIn": "Ingia",
    "auth.signingIn": "Inaingia",
    "auth.newHere": "Mgeni hapa?",
    "auth.createAccount": "Fungua akaunti bure",
    "auth.createTitle": "Fungua akaunti yako",
    "auth.signupSubtitle": "Barua pepe na nenosiri tu. Hakuna simu, hakuna fomu ndefu.",
    "auth.signupBadge": "Bure kabisa, sekunde 10 tu",
    "auth.passwordHint": "Angalau herufi 6",
    "auth.passwordShort": "Herufi 6 na uko tayari.",
    "auth.startChatting": "Anza kuzungumza",
    "auth.creatingAccount": "Inafungua akaunti",
    "auth.alreadyHave": "Tayari una akaunti?",
    "auth.disclaimer":
      "Kwa kuendelea, unakubali kutumia Maisha Chat kwa mwongozo wa kielimu tu. Si badala ya ushauri wa kimatibabu.",

    "theme.toLight": "Badili mwanga",
    "theme.toDark": "Badili giza",

    "lang.en": "EN",
    "lang.sw": "SW",
    "lang.switchToEn": "Badili Kiingereza",
    "lang.switchToSw": "Badili Kiswahili",

    "sidebar.newChat": "Mazungumzo mapya",
    "sidebar.modelArena": "Uwanja wa modeli",
    "sidebar.leaderboard": "Ubao wa washindi",
    "sidebar.admin": "Dashibodi ya msimamizi",
    "sidebar.recent": "Hivi karibuni",
    "sidebar.noConversations": "Hakuna mazungumzo bado",
    "sidebar.noConversationsHint": "Bofya Mazungumzo mapya uulize Maisha chochote.",
    "sidebar.untitled": "Bila jina",
    "sidebar.expand": "Panua upau wa pembeni",
    "sidebar.collapse": "Ficha upau wa pembeni",

    "chat.you": "Wewe",
    "chat.assistant": "Maisha",
    "chat.thinking": "inafikiri...",
    "chat.emptyTitle": "Naweza kukusaidia vipi leo?",
    "chat.emptyBody":
      "Uliza chochote kuhusu ustahili wa kuchangia damu, mchakato, kupona, au kituo cha karibu nawe.",
    "chat.copy": "Nakili",
    "chat.copied": "Imenakiliwa",
    "chat.regenerate": "Tengeneza tena",
    "chat.inputPlaceholder": "Andika ujumbe kwa Maisha...",
    "chat.send": "Tuma",
    "chat.webSearch": "Tafuta mtandaoni",
    "chat.webSearchHint": "Tafuta taarifa za kisasa mtandaoni kabla ya kujibu",
    "chat.webSearching": "Inatafuta mtandaoni...",
    "chat.sources": "Vyanzo",
    "chat.viewSources": "Panua vyanzo",
    "chat.sourcesPanelTitle": "Vyanzo vya mtandaoni",
    "chat.closeSources": "Funga paneli ya vyanzo",
    "chat.noSourceUrl": "Hakuna kiungo",
    "chat.untitledSource": "Chanzo bila jina",
    "chat.loadingModels": "Inapakia modeli...",
    "chat.disclaimer":
      "Maisha inatoa taarifa za jumla na si badala ya ushauri wa kimatibabu.",
    "chat.suggest1": "Je, naweza kuchangia damu sasa hivi?",
    "chat.suggest2": "Nile nini kabla ya kuchangia damu?",
    "chat.suggest3": "Kituo cha karibu cha kuchangia damu kiko wapi?",
    "chat.suggest4": "Itachukua muda gani kuchangia tena baada ya mchango wangu wa mwisho?",

    "profile.signOut": "Toka",
    "profile.switchThemeLight": "Badili mwanga",
    "profile.switchThemeDark": "Badili giza",
    "profile.switchLanguage": "Badili lugha",

    "landing.heroTitleStart": "Okoa maisha,",
    "landing.heroTitleHighlight": "mazungumzo",
    "landing.heroTitleEnd": "moja kwa wakati.",
    "landing.heroBadge": "AI kwa uchangiaji damu unaookoa maisha",
    "landing.heroBodyRest":
      "ni rafiki yako wa AI kwa kila jambo la uchangiaji damu nchini Tanzania: ustahili, mchakato, kupona, na mahali pa kuchangia damu karibu nawe. Inapatikana saa 24 kwa Kiingereza na Kiswahili.",
    "landing.ctaContinue": "Endelea kuzungumza",
    "landing.ctaStartFree": "Anza kuzungumza bure",
    "landing.ctaHow": "Angalia jinsi inavyofanya kazi",
    "landing.trustFree": "Bure kabisa",
    "landing.trustPrivate": "Faragha na usalama",
    "landing.trustInstant": "Majibu ya papo hapo",
    "landing.mockQuestion": "Je, naweza kuchangia damu leo?",
    "landing.mockAnswerIntro": "Labda ndiyo! Kuchangia leo, kwa ujumla unahitaji:",
    "landing.mockBullet1": "Umri wa miaka 18 - 65",
    "landing.mockBullet2": "Angalau kilo 50",
    "landing.mockBullet3": "Kuwa na afya njema, bila homa au maambukizi",
    "landing.mockBullet4": "Angalau miezi 3 tangu mchango wako wa mwisho",
    "landing.mockAnswerOutro": "Ungependa nikupatie benki ya damu iliyo karibu nawe?",
    "landing.mockPlaceholder": "Uliza Maisha chochote...",
    "landing.stat1.value": "1 kati ya 3",
    "landing.stat1.label": "watu watahitaji damu maishani mwao",
    "landing.stat2.value": "Maisha 3",
    "landing.stat2.label": "yanaweza kuokolewa kwa mchango mmoja wa damu",
    "landing.stat3.value": "Saa 24",
    "landing.stat3.label": "majibu papo hapo kwa Kiingereza na Kiswahili",
    "landing.featuresEyebrow": "Unachoweza kuuliza",
    "landing.featuresTitle": "Kila kitu unachohitaji kuchangia damu kwa ujasiri.",
    "landing.featuresBody":
      "Kuanzia mchango wako wa kwanza hadi wa mia, Maisha iko nawe kila hatua.",
    "landing.feature1.title": "Angalia ustahili wako",
    "landing.feature1.body":
      "Jua ndani ya sekunde kama unaweza kuchangia leo kulingana na umri, afya, safari, dawa, na mchango wako wa mwisho.",
    "landing.feature2.title": "Tafuta kituo karibu nawe",
    "landing.feature2.body":
      "Pata maelekezo, saa za kufunguliwa, na mawasiliano ya benki za damu na kampeni za uchangiaji nchini Tanzania.",
    "landing.feature3.title": "Panga mchango wako ujao",
    "landing.feature3.body":
      "Fuata muda unaofaa wa kuchangia tena na upate ukumbusho ili usikose fursa ya kusaidia.",
    "landing.feature4.title": "Elewa mchakato",
    "landing.feature4.body":
      "Mwongozo wa hatua kwa hatua wa usajili, uchunguzi, uchangiaji, na kupona.",
    "landing.feature5.title": "Utunzaji baada ya kuchangia",
    "landing.feature5.body":
      "Ushauri wa chakula, kupona, na dalili za kuzingatia, kulingana na miongozo ya sasa.",
    "landing.feature6.title": "Himiza wengine",
    "landing.feature6.body":
      "Vunja hadithi potofu na jifunze jinsi ya kuwahamasisha marafiki na familia kuchangia kwa ujasiri.",
    "landing.howEyebrow": "Jinsi inavyofanya kazi",
    "landing.howTitle": "Kutoka swali hadi uamuzi wa kujiamini, hatua tatu.",
    "landing.step1.title": "Uliza chochote",
    "landing.step1.body":
      "Andika swali lako kwa Kiingereza au Kiswahili rahisi. Hakuna istilahi ngumu za kimatibabu.",
    "landing.step2.title": "Chagua modeli yako",
    "landing.step2.body":
      "Chagua kati ya LLM tatu zilizoboreshwa kwa uchangiaji damu na badilisha wakati wowote.",
    "landing.step3.title": "Pata jibu thabiti",
    "landing.step3.body":
      "Pokea jibu wazi na la huruma pamoja na hatua zinazofuata na mapendekezo ya kuaminika.",
    "landing.modelsEyebrow": "Chagua akili yako",
    "landing.modelsTitle": "LLM tatu za uchangiaji damu, zinazobadilishwa papo hapo.",
    "landing.modelsBody":
      "Kila modeli imeboreshwa kwa mazungumzo ya uchangiaji damu ili upate majibu yanayotegemea uzoefu halisi.",
    "landing.model1.tagline": "Modeli ya Google yenye ufanisi wa 4B",
    "landing.model1.body":
      "Imeboreshwa kwa mazungumzo ya uchangiaji damu yenye hatua nyingi na ufuataji mzuri wa maelekezo.",
    "landing.model2.tagline": "Modeli ya Alibaba ya lugha nyingi ya 4B",
    "landing.model2.body":
      "Bora kwa Kiingereza na Kiswahili, inafaa kwa mazungumzo ya jamii Afrika Mashariki.",
    "landing.model3.tagline": "Modeli nyepesi ya Meta ya 3B",
    "landing.model3.body":
      "Majibu ya haraka kwa ukaguzi wa ustahili na maswali ya mara kwa mara.",
    "landing.trustEncrypted": "Imesimbwa kuanzia mwanzo hadi mwisho",
    "landing.trustWho": "Inafuata miongozo ya WHO na NBTS",
    "landing.trustBuiltFor": "Imetengenezwa kwa Tanzania, kwa Kiingereza na Kiswahili",
    "landing.trustAvailable": "Inapatikana saa 24",
    "landing.faqEyebrow": "Maswali",
    "landing.faqTitle": "Maswali yanayoulizwa mara kwa mara",
    "landing.faq1.q": "Je, Maisha Chat ni badala ya daktari au benki ya damu?",
    "landing.faq1.a":
      "Hapana. Maisha inatoa mwongozo wa jumla kukusaidia kuelewa mchakato wa kuchangia na kujiandaa. Kwa maamuzi ya kimatibabu, wasiliana na mtaalamu wa afya au benki ya damu iliyo karibu.",
    "landing.faq2.q": "Je, mazungumzo yangu ni ya faragha?",
    "landing.faq2.a":
      "Ndiyo. Akaunti na historia yako ya mazungumzo huhifadhiwa kwa usalama na unaonekana kwako tu. Hatushiriki data yako na wahusika wengine.",
    "landing.faq3.q": "Inaunga mkono lugha gani?",
    "landing.faq3.a":
      "Kiingereza na Kiswahili vinafanya kazi vizuri leo, na modeli ya Qwen ina uwezo mpana zaidi wa lugha nyingi.",
    "landing.faq4.q": "Je, ni bure kutumia?",
    "landing.faq4.a":
      "Ndiyo. Maisha Chat ni bure kama sehemu ya dhamira yetu ya kufanya maarifa ya uchangiaji damu yapatikane kwa kila mtu nchini Tanzania.",
    "landing.ctaTitle": "Uko tayari kuokoa maisha?",
    "landing.ctaBody":
      "Fungua akaunti yako bure na uanze kuzungumza na Maisha sasa hivi. Hakuna kadi ya mkopo, hakuna usakinishaji.",
    "landing.footerBuilt": "Imetengenezwa kwa upendo nchini Tanzania.",
    "landing.arenaEyebrow": "Uwanja wa modeli",
    "landing.arenaTitle": "Linganisha modeli na upige kura kwa jibu bora.",
    "landing.arenaBody":
      "Uliza swali moja la uchangiaji damu na modeli mbili zisizojulikana zinajibu kwa pamoja. Chagua jibu unaloiamini zaidi. Kila kura huongeza ubao wa Elo wa moja kwa moja ili jamii ione modeli bora zaidi.",
    "landing.arenaStep1.title": "Uliza mara moja",
    "landing.arenaStep1.body":
      "Andika swali lolote la ustahili, mchakato, au kupona kwa Kiingereza au Kiswahili. Modeli zote mbili zinapata swali lile lile.",
    "landing.arenaStep2.title": "Linganisha bila kujua",
    "landing.arenaStep2.body":
      "Soma majibu mawili yanayotiririka upande kwa upande bila kujua ni modeli gani iliyoandika hadi upige kura.",
    "landing.arenaStep3.title": "Piga kura na panga",
    "landing.arenaStep3.body":
      "Chagua mshindi, sema ni sare, au weka alama kuwa yote ni dhaifu. Kura yako husasisha alama za Elo kwenye ubao wa moja kwa moja.",
    "landing.arenaCtaTry": "Jaribu uwanja",
    "landing.arenaCtaLeaderboard": "Angalia ubao wa moja kwa moja",
    "landing.heroTitle": "Okoa maisha, mazungumzo moja kwa wakati.",
    "landing.heroBody":
      "Maisha Chat ni rafiki yako wa AI kwa kila jambo la uchangiaji damu nchini Tanzania: ustahili, mchakato, kupona, na mahali pa kuchangia damu karibu nawe. Inapatikana saa 24 kwa Kiingereza na Kiswahili.",
    "landing.ctaStart": "Anza bure",
    "landing.ctaChat": "Fungua mazungumzo",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function translate(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}
