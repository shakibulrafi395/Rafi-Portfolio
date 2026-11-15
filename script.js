const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    siteNav.classList.toggle('open', !isOpen);
  });

  siteNav.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    siteNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle && siteNav) {
    siteNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
});

const sections = [...document.querySelectorAll('#home, #about, #skills, #projects, #credentials, #learning, #contact')];
let navUpdatePending = false;

const updateActiveNav = () => {
  if (navUpdatePending) return;
  navUpdatePending = true;

  window.requestAnimationFrame(() => {
    navUpdatePending = false;
    const current = sections
      .map((section) => ({ section, top: section.getBoundingClientRect().top }))
      .filter(({ top }) => top <= window.innerHeight * .4)
      .sort((a, b) => b.top - a.top)[0]?.section || sections[0];

    if (!current) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${current.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
};

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav);
window.addEventListener('hashchange', updateActiveNav);
updateActiveNav();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('in-view'));
}

const slider = document.querySelector('[data-slider]');
const testimonialSlides = [...document.querySelectorAll('.testimonial')];
const sliderDots = [...document.querySelectorAll('.slider-dots button')];
let activeSlide = 0;

function showSlide(index) {
  activeSlide = (index + testimonialSlides.length) % testimonialSlides.length;
  testimonialSlides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === activeSlide));
  sliderDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === activeSlide);
    dot.setAttribute('aria-pressed', String(dotIndex === activeSlide));
  });
}

slider?.querySelector('.slider-arrow--prev')?.addEventListener('click', () => showSlide(activeSlide - 1));
slider?.querySelector('.slider-arrow--next')?.addEventListener('click', () => showSlide(activeSlide + 1));
sliderDots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

const projectDetails = {
  student: {
    title: 'Student Manager',
    copy: 'A clean dashboard concept for organizing student records, attendance, course activity, and performance insights in one place.',
    tags: ['React', 'Node.js', 'MongoDB'],
  },
  eco: {
    title: 'EcoTrack',
    copy: 'A friendly sustainability companion that helps people understand daily carbon habits and discover practical ways to live greener.',
    tags: ['HTML & CSS', 'JavaScript', 'UI Design'],
  },
  tuneflow: {
    title: 'TuneFlow',
    copy: 'A vibrant music streaming interface built around playlists, discovery, and a focused listening experience.',
    tags: ['React', 'Tailwind CSS', 'Firebase'],
  },
  all: {
    title: 'Project Concepts',
    copy: 'These concepts represent areas Rafi is exploring. Add finished project links and case studies here as they become available.',
    tags: ['Web Apps', 'UI/UX', 'Learning Projects'],
  },
  blog: {
    title: 'Design & Development Notes',
    copy: 'A place for ideas, useful concepts, and lessons learned while building thoughtful web experiences.',
    tags: ['JavaScript', 'Productivity', 'Web Development'],
  },
};

const projectDialog = document.querySelector('.project-dialog');
const dialogTitle = projectDialog?.querySelector('#dialog-title');
const dialogCopy = projectDialog?.querySelector('.dialog-copy');
const dialogTags = projectDialog?.querySelector('.dialog-tags');

function openProjectDialog(projectId) {
  const project = projectDetails[projectId];
  if (!project || !projectDialog || !dialogTitle || !dialogCopy || !dialogTags) return;
  dialogTitle.textContent = project.title;
  dialogCopy.textContent = project.copy;
  dialogTags.replaceChildren(...project.tags.map((tag) => {
    const tagElement = document.createElement('span');
    tagElement.textContent = tag;
    return tagElement;
  }));
  projectDialog.showModal();
  document.body.classList.add('modal-open');
}

document.querySelectorAll('[data-open-project]').forEach((button) => {
  button.addEventListener('click', () => openProjectDialog(button.dataset.openProject));
});

projectDialog?.querySelector('.dialog-close')?.addEventListener('click', () => projectDialog.close());
projectDialog?.addEventListener('click', (event) => {
  if (event.target === projectDialog) projectDialog.close();
});
projectDialog?.addEventListener('close', () => document.body.classList.remove('modal-open'));

document.querySelectorAll('.year').forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const contactForm = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');
const contactSubmit = contactForm?.querySelector('.contact-submit');
const emailClient = window.emailjs;

if (contactForm && formStatus && contactSubmit) {
  if (emailClient) {
    emailClient.init({ publicKey: 'D2aKq0zpnbAUrzpeo' });
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      contactSubmit.classList.remove('is-flying');
      void contactSubmit.offsetWidth;
      contactSubmit.classList.add('is-flying');
    }

    if (!emailClient) {
      formStatus.textContent = 'Email service is unavailable. Please email 251-35-395@diu.edu.bd directly.';
      return;
    }

    contactSubmit.disabled = true;
    formStatus.textContent = 'Sending your message...';

    try {
      await emailClient.sendForm('service_hrj6rcr', 'template_c5oh67a', contactForm);
      formStatus.textContent = 'Thanks! Your message has been sent.';
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = 'Your message could not be sent. Please try again or email 251-35-395@diu.edu.bd directly.';
    } finally {
      contactSubmit.disabled = false;
    }
  });
}

const chatPanel = document.querySelector('.chat-panel');
const chatLauncher = document.querySelector('.chat-launcher');
const chatClose = document.querySelector('.chat-close');
const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('#chat-input');
const chatMessages = document.querySelector('.chat-messages');

function setChatOpen(isOpen) {
  if (!chatPanel || !chatLauncher) return;
  chatPanel.hidden = !isOpen;
  chatLauncher.setAttribute('aria-expanded', String(isOpen));
  chatLauncher.setAttribute('aria-label', isOpen ? 'Close portfolio FAQ' : 'Open portfolio FAQ');
  if (isOpen) chatInput?.focus();
  else chatLauncher.focus();
}

chatLauncher?.addEventListener('click', () => {
  setChatOpen(chatLauncher.getAttribute('aria-expanded') !== 'true');
});
chatClose?.addEventListener('click', () => setChatOpen(false));

function getPortfolioAnswer(question) {
  const asksInBangla = /[\u0980-\u09FF]/.test(question);
  const topics = [
    {
      pattern: /\baol\b|day.?long|aol|এওএল/i,
      en: "Rafi has a certificate from AOL's day-long program.",
      bn: 'রাফির AOL-এর day-long program-এর একটি certificate আছে।',
      links: [
        { href: 'CV_Certificate/AOL_Day_Long_Program_Certificate.pdf', en: 'Download AOL certificate', bn: 'AOL certificate ডাউনলোড', download: true },
        { href: '#credentials', en: 'All certificates', bn: 'সব certificate' },
      ],
    },
    {
      pattern: /computer architecture|\bcs301\b|কম্পিউটার আর্কিটেকচার/i,
      en: 'Rafi has a CS301 Computer Architecture course certificate.',
      bn: 'রাফির CS301 Computer Architecture course-এর certificate আছে।',
      links: [
        { href: 'CV_Certificate/Computer%20Architecture%20certificate.pdf', en: 'Download certificate', bn: 'Certificate ডাউনলোড', download: true },
        { href: '#credentials', en: 'All certificates', bn: 'সব certificate' },
      ],
    },
    {
      pattern: /\bcv\b|resume|résumé|curriculum vitae|জীবনবৃত্তান্ত|সিভি/i,
      en: "Rafi's CV covers his education, technical skills, and project experience. Download it here:",
      bn: 'রাফির CV-তে তার পড়াশোনা, technical skills ও project experience-এর তথ্য আছে। এখান থেকে ডাউনলোড করুন:',
      links: [
        { href: 'CV_Certificate/Shakibul_Islam_Rafi_CV.pdf', en: 'Download CV', bn: 'CV ডাউনলোড', download: true },
      ],
    },
    {
      pattern: /certificate|certification|credential|সার্টিফিকেট|সনদ|সার্টিফিকেশন/i,
      en: 'The portfolio includes a Computer Architecture course certificate and an AOL day-long program certificate.',
      bn: 'পোর্টফোলিওতে Computer Architecture course certificate এবং AOL day-long program certificate আছে।',
      links: [
        { href: 'CV_Certificate/Computer%20Architecture%20certificate.pdf', en: 'Computer Architecture', bn: 'Computer Architecture', download: true },
        { href: 'CV_Certificate/AOL_Day_Long_Program_Certificate.pdf', en: 'AOL day-long program', bn: 'AOL day-long program', download: true },
      ],
    },
    {
      pattern: /linkedin|github|social|লিংকডইন|গিটহাব|সোশ্যাল/i,
      en: 'Find Rafi on LinkedIn and GitHub:',
      bn: 'রাফির LinkedIn ও GitHub প্রোফাইল:',
      links: [
        { href: 'https://www.linkedin.com/in/shakibul-islam-rafi-480a17347/', en: 'LinkedIn', bn: 'LinkedIn', external: true },
        { href: 'https://github.com/shakibulrafi395', en: 'GitHub', bn: 'GitHub', external: true },
      ],
    },
    {
      pattern: /student manager|attendance|student record|স্টুডেন্ট ম্যানেজার|শিক্ষার্থীর তথ্য/i,
      en: 'Student Manager is a practice dashboard concept for organizing student records, attendance, and progress, using React, Node.js, and MongoDB.',
      bn: 'Student Manager হলো শিক্ষার্থীদের তথ্য, attendance ও অগ্রগতি গুছিয়ে রাখার dashboard concept; এতে React, Node.js ও MongoDB উল্লেখ আছে।',
      href: '#projects',
      linkEn: 'View projects',
      linkBn: 'প্রজেক্ট দেখুন',
    },
    {
      pattern: /ecotrack|eco.?track|sustainab|carbon|ইকোট্র্যাক|পরিবেশ/i,
      en: 'EcoTrack is a sustainability dashboard concept for exploring everyday environmental habits, built around HTML, CSS, and JavaScript.',
      bn: 'EcoTrack হলো দৈনন্দিন পরিবেশবান্ধব অভ্যাস দেখার একটি sustainability dashboard concept; এখানে HTML, CSS ও JavaScript ব্যবহারের কথা আছে।',
      href: '#projects',
      linkEn: 'View projects',
      linkBn: 'প্রজেক্ট দেখুন',
    },
    {
      pattern: /tuneflow|tune flow|music|playlist|গান|মিউজিক/i,
      en: 'TuneFlow is a music discovery and playlist interface concept. Its listed technologies are React, Tailwind CSS, and Firebase.',
      bn: 'TuneFlow হলো music discovery ও playlist interface concept; এতে React, Tailwind CSS ও Firebase উল্লেখ আছে।',
      href: '#projects',
      linkEn: 'View projects',
      linkBn: 'প্রজেক্ট দেখুন',
    },
    {
      pattern: /skill|technology|technologies|tech stack|html|css|javascript|react|node|java|python|mysql|figma|দক্ষতা|স্কিল|প্রযুক্তি/i,
      en: 'Rafi works with HTML, CSS, JavaScript, React, Node.js, Java, Python, MySQL, Git, and Figma, and continues to grow these skills.',
      bn: 'রাফি HTML, CSS, JavaScript, React, Node.js, Java, Python, MySQL, Git ও Figma নিয়ে কাজ করেন এবং নিয়মিত দক্ষতা বাড়াচ্ছেন।',
      href: '#skills',
      linkEn: 'View skills',
      linkBn: 'দক্ষতাগুলো দেখুন',
    },
    {
      pattern: /project|work|প্রজেক্ট|প্রকল্প|কাজ/i,
      en: 'Rafi is exploring three project concepts: Student Manager (student records and progress), EcoTrack (sustainability habits), and TuneFlow (music discovery). These are learning concepts, not presented as finished products.',
      bn: 'রাফি তিনটি project concept নিয়ে কাজ করছেন: Student Manager (শিক্ষার্থীদের তথ্য ও অগ্রগতি), EcoTrack (পরিবেশবান্ধব অভ্যাস), এবং TuneFlow (music discovery)। এগুলো শেখার project concept, সম্পূর্ণ product হিসেবে দেখানো হয়নি।',
      href: '#projects',
      linkEn: 'View projects',
      linkBn: 'প্রজেক্টগুলো দেখুন',
    },
    {
      pattern: /education|study|student|university|cse|পড়াশোনা|শিক্ষা|ছাত্র|শিক্ষার্থী/i,
      en: 'Rafi is studying Software Engineering (SWE) at Daffodil International University in Bangladesh. He is building practical software skills and exploring web development.',
      bn: 'রাফি বাংলাদেশের Daffodil International University-এর Software Engineering (SWE) বিভাগে পড়াশোনা করছেন। তিনি ব্যবহারিক software skill তৈরি করছেন এবং web development শিখছেন।',
      href: '#education',
      linkEn: 'View education',
      linkBn: 'শিক্ষার তথ্য দেখুন',
    },
    {
      pattern: /learning|explor|currently|responsive|web fundamental|feedback|শিখ|অন্বেষণ|ফিডব্যাক/i,
      en: 'Rafi is currently exploring responsive interface design, web fundamentals with JavaScript, and taking project ideas from concept to practice. He values learning fundamentals, iteration, and feedback.',
      bn: 'রাফি responsive interface design, JavaScript-সহ web fundamentals এবং project idea-কে বাস্তবে রূপ দেওয়া শিখছেন। তিনি ভিত্তি মজবুত করা, বারবার উন্নতি করা ও feedback-কে গুরুত্ব দেন।',
      href: '#learning',
      linkEn: 'View learning goals',
      linkBn: 'শেখার বিষয়গুলো দেখুন',
    },
    {
      pattern: /stat|how many years|experience level|collaborat|team|সহযোগিতা|দল|পরিসংখ্যান/i,
      en: "The portfolio describes Rafi as a CSE student focused on web development, learning by building, and being a curious collaborator. It doesn't claim a number of professional experience years.",
      bn: 'পোর্টফোলিওতে রাফিকে CSE শিক্ষার্থী, web development-এ আগ্রহী, কাজ করে শিখতে থাকা এবং কৌতূহলী সহযোগী হিসেবে তুলে ধরা হয়েছে। পেশাগত অভিজ্ঞতার বছরের কোনো সংখ্যা উল্লেখ নেই।',
      href: '#about',
      linkEn: 'View profile',
      linkBn: 'পরিচিতি দেখুন',
    },
    {
      pattern: /approach|mindset|value|design|guide|feedback|thought|testimonial|quote|কাজের ধরন|দৃষ্টিভঙ্গি|মূল্যবোধ/i,
      en: 'Rafi likes turning ideas into practical work, designing with users in mind, learning from feedback, and improving through iteration.',
      bn: 'রাফি idea-কে ব্যবহারিক কাজে রূপ দিতে, ব্যবহারকারীর কথা ভেবে design করতে, feedback থেকে শিখতে এবং ধাপে ধাপে উন্নতি করতে পছন্দ করেন।',
      href: '#education',
      linkEn: 'Read about his approach',
      linkBn: 'কাজের ধরন জানুন',
    },
    {
      pattern: /contact|email|hire|message|যোগাযোগ|ইমেইল|নিয়োগ|ফোন|কল/i,
      en: 'Contact Rafi using the form, email 251-35-395@diu.edu.bd, or call +880 1947-075240.',
      bn: 'ফর্মে যোগাযোগ করুন, 251-35-395@diu.edu.bd ঠিকানায় ইমেইল করুন, অথবা +880 1947-075240 নম্বরে কল করুন।',
      links: [
        { href: '#contact', en: 'Contact form', bn: 'যোগাযোগ ফর্ম' },
        { href: 'mailto:251-35-395@diu.edu.bd', en: 'Email Rafi', bn: 'ইমেইল করুন' },
        { href: 'tel:+8801947075240', en: 'Call +880 1947-075240', bn: 'কল: +880 1947-075240' },
      ],
    },
    {
      pattern: /location|based|where|language|bangla|bengali|english|বাংলাদেশ|কোথায়|অবস্থান|ভাষা|বাংলা|ইংরেজি/i,
      en: 'Rafi is based in Zirabo, Ashulia, Savar, Dhaka, Bangladesh and speaks Bangla and English.',
      bn: 'রাফি জিরাবো, আশুলিয়া, সাভার, ঢাকায় থাকেন এবং বাংলা ও ইংরেজিতে কথা বলেন।',
      href: '#about',
      linkEn: 'About Rafi',
      linkBn: 'রাফি সম্পর্কে',
    },
    {
      pattern: /available|opportunit|hire|কাজের সুযোগ|সুযোগ/i,
      en: 'Rafi is open to learning and professional opportunities. Use the contact form or his email to get in touch.',
      bn: 'রাফি শেখার ও পেশাগত সুযোগের জন্য আগ্রহী। যোগাযোগের ফর্ম বা ইমেইলে তার সঙ্গে কথা বলুন।',
      href: '#contact',
      linkEn: 'Contact Rafi',
      linkBn: 'যোগাযোগ করুন',
    },
    {
      pattern: /about|who|yourself|rafi|name|কে|রাফি|নিজের|নাম/i,
      en: 'Shakibul Islam Rafi is a curious Computer Science and Engineering student and aspiring software developer in Bangladesh. He enjoys building useful, responsive web experiences and turning ideas into clean, intuitive interfaces.',
      bn: 'শাকিবুল ইসলাম রাফি বাংলাদেশের একজন কৌতূহলী Computer Science and Engineering-এর শিক্ষার্থী ও aspiring software developer। তিনি উপকারী responsive web experience তৈরি এবং idea-কে পরিষ্কার, সহজ interface-এ রূপ দিতে পছন্দ করেন।',
      href: '#about',
      linkEn: 'Read about Rafi',
      linkBn: 'রাফি সম্পর্কে পড়ুন',
    },
    {
      pattern: /portfolio|website|site|section|everything|all about|help|পোর্টফোলিও|ওয়েবসাইট|সেকশন|সবকিছু|সব তথ্য/i,
      en: "Explore Rafi's portfolio sections:",
      bn: 'রাফির পোর্টফোলিওর অংশগুলো ঘুরে দেখুন:',
      links: [
        { href: '#about', en: 'About', bn: 'পরিচিতি' },
        { href: '#skills', en: 'Skills', bn: 'দক্ষতা' },
        { href: '#projects', en: 'Projects', bn: 'প্রজেক্ট' },
        { href: '#education', en: 'Education', bn: 'শিক্ষা' },
        { href: '#credentials', en: 'Certificates', bn: 'সার্টিফিকেট' },
        { href: '#learning', en: 'Learning', bn: 'শেখা' },
        { href: '#contact', en: 'Contact', bn: 'যোগাযোগ' },
      ],
    },
    {
      pattern: /chatbot|chat bot|assistant|কথোপকথন|চ্যাটবট/i,
      en: "This portfolio guide answers questions about Rafi's profile, skills, projects, education, certificates, learning goals, and contact links.",
      bn: 'এই portfolio guide-এ রাফির পরিচিতি, দক্ষতা, প্রজেক্ট, পড়াশোনা, certificate, শেখার লক্ষ্য ও যোগাযোগের তথ্য জানা যায়।',
      href: '#home',
      linkEn: 'Explore the portfolio',
      linkBn: 'পোর্টফোলিও দেখুন',
    },
  ];
  const topic = topics.find(({ pattern }) => pattern.test(question));

  if (topic) {
    const links = topic.links || [{ href: topic.href, en: topic.linkEn, bn: topic.linkBn }];
    return {
      text: asksInBangla ? topic.bn : topic.en,
      links: links.map(({ href, en, bn, download, external }) => ({
        href,
        label: asksInBangla ? bn : en,
        download,
        external,
      })),
    };
  }

  return {
    text: asksInBangla
      ? 'এই বিষয়ে আমার কাছে তথ্য নেই। আরও জানতে পোর্টফোলিওর Contact অংশে রাফিকে মেসেজ করতে পারেন।'
      : 'I don’t have details about that yet. You can message Rafi through the Contact section for more information.',
    links: [{ href: '#contact', label: asksInBangla ? 'যোগাযোগে যান' : 'Go to contact' }],
  };
}

function addChatMessage(message, sender, links = []) {
  if (!chatMessages) return;
  const messageElement = document.createElement('p');
  messageElement.className = `chat-message chat-message--${sender}`;
  messageElement.textContent = message;
  links.forEach(({ href, label, download, external }) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    if (download) link.setAttribute('download', '');
    if (external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    messageElement.append(' ', link);
  });
  chatMessages.append(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function answerChatQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) return;
  addChatMessage(cleanQuestion, 'user');
  const answer = getPortfolioAnswer(cleanQuestion);
  addChatMessage(answer.text, 'assistant', answer.links);
}

chatForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!chatInput) return;
  answerChatQuestion(chatInput.value);
  chatInput.value = '';
  chatInput.focus();
});

chatMessages?.querySelectorAll('.chat-suggestions button').forEach((button) => {
  button.addEventListener('click', () => answerChatQuestion(button.textContent || ''));
});

chatMessages?.addEventListener('click', (event) => {
  if (event.target.closest('a[href^="#"]')) setChatOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && chatLauncher?.getAttribute('aria-expanded') === 'true') {
    setChatOpen(false);
  }
});
