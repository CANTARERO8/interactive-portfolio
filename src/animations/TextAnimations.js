import gsap from "gsap";

export class TextAnimations {
  constructor() {
    this.splitTitles();
    this.splitContentText();
    this.animatedSections = new Set();
  }

  bootAnimations() {
    this.animatedSections.delete("hero");
    document.querySelectorAll("#hero .scramble-revealed").forEach(el => el.classList.remove("scramble-revealed"));

    this.animateHeroFloat();
    this.animateSectionIn("hero");
    this.glitchHeroDescription();
    this.glitchHeroTitle();
  }

  splitTitles() {
    const titles = document.querySelectorAll(
      "#hero-main-title, #about-title-heading, #vue-title-heading, #laravel-title-heading, #postgresql-title-heading, #wordpress-title-heading, #footer-main-heading"
    );

    titles.forEach(title => {
      if (title.classList.contains("split-done")) return;

      const lines = title.innerHTML.split(/<br\s*\/?>/i);
      let newHTML = "";
      let charIdx = 0;

      lines.forEach((line, lineIdx) => {
        const hasSpan = /<span/i.test(line);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = line;
        const innerText = (tempDiv.innerText || tempDiv.textContent || "").replace(/\r?\n|\r/g, "").trim();

        let lineSpans = "";
        for (let char of innerText) {
          if (char === " ") {
            lineSpans += "<span class=\"char-span\" style=\"display:inline-block;width:0.25em\">&nbsp;</span>";
          } else {
            lineSpans += "<span class=\"char-span\" data-char=\"" + char + "\" style=\"display:inline-block;opacity:0;--char-idx:" + charIdx + "\">" + char + "</span>";
            charIdx++;
          }
        }

        const lineContent = hasSpan ? "<span>" + lineSpans + "</span>" : lineSpans;
        newHTML += "<div class=\"line-wrapper\" style=\"overflow:visible;display:block\">" + lineContent + "</div>";
        if (lineIdx < lines.length - 1) newHTML += "<br />";
      });

      title.innerHTML = newHTML;
      title.classList.add("split-done");
    });
  }

  splitContentText() {
    document.querySelectorAll(".scene-section .mono.sm").forEach(el => {
      if (el.classList.contains("split-done")) return;
      const text = el.textContent;
      let html = "";
      for (let char of text) {
        if (char === " ") {
          html += "<span class=\"char-span\" style=\"display:inline-block;width:0.25em\">&nbsp;</span>";
        } else {
          html += "<span class=\"char-span\" data-char=\"" + char + "\" style=\"display:inline-block;opacity:0\">" + char + "</span>";
        }
      }
      el.innerHTML = html;
      el.classList.add("split-done");
    });

    const heroDesc = document.querySelector("#hero-description");
    if (heroDesc && !heroDesc.classList.contains("split-done")) {
      const text = heroDesc.textContent;
      let html = "";
      for (let char of text) {
        html += "<span class=\"char-span glitch-char\" style=\"display:inline-block;opacity:1;color:var(--color-text-sub)\">" + (char === " " ? "&nbsp;" : char) + "</span>";
      }
      heroDesc.innerHTML = html;
      heroDesc.classList.add("split-done");
    }

    document.querySelectorAll(".about-text, .footer-credits").forEach(el => {
      if (el.classList.contains("split-done")) return;
      const words = el.textContent.trim().split(/\s+/);
      let html = "";
      words.forEach((word, i) => {
        html += "<span class=\"word-span\" style=\"display:inline-block;opacity:0\">" + word + (i < words.length - 1 ? "&nbsp;" : "") + "</span>";
      });
      el.innerHTML = html;
      el.classList.add("split-done");
    });

    document.querySelectorAll(".spec-value").forEach(el => {
      if (el.classList.contains("split-done")) return;
      const text = el.textContent;
      let html = "";
      for (let char of text) {
        if (char === " ") {
          html += "<span class=\"char-span\" style=\"display:inline-block;width:0.25em\">&nbsp;</span>";
        } else {
          html += "<span class=\"char-span\" data-char=\"" + char + "\" style=\"display:inline-block;opacity:0\">" + char + "</span>";
        }
      }
      el.innerHTML = html;
      el.classList.add("split-done");
    });

    document.querySelectorAll(".metric-label").forEach(el => {
      if (el.classList.contains("split-done")) return;
      const words = el.textContent.trim().split(/\s+/);
      let html = "";
      words.forEach((word, i) => {
        html += "<span class=\"word-span\" style=\"display:inline-block;opacity:0\">" + word + (i < words.length - 1 ? "&nbsp;" : "") + "</span>";
      });
      el.innerHTML = html;
      el.classList.add("split-done");
    });

    document.querySelectorAll(".project-name").forEach(el => {
      if (el.classList.contains("split-done")) return;
      const text = el.textContent;
      let html = "";
      for (let char of text) {
        if (char === " ") {
          html += "<span class=\"char-span\" style=\"display:inline-block;width:0.25em\">&nbsp;</span>";
        } else {
          html += "<span class=\"char-span\" data-char=\"" + char + "\" style=\"display:inline-block;opacity:0\">" + char + "</span>";
        }
      }
      el.innerHTML = html;
      el.classList.add("split-done");
    });
  }

  animateHeroFloat() {
    const tag = document.querySelector("#hero-subtitle-tag");
    if (!tag) return;

    gsap.to(tag, {
      y: -4,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  glitchHeroDescription() {
    const chars = document.querySelectorAll("#hero-description .glitch-char");
    if (!chars.length) return;

    const glitch = () => {
      const count = 2 + Math.floor(Math.random() * 5);
      const indices = new Set();
      while (indices.size < count && indices.size < chars.length) {
        indices.add(Math.floor(Math.random() * chars.length));
      }

      indices.forEach(idx => {
        const char = chars[idx];
        const type = Math.floor(Math.random() * 4);

        if (type === 0) {
          gsap.to(char, { opacity: 0.05, duration: 0.02 });
          gsap.to(char, { opacity: 0.7, duration: 0.04, delay: 0.05 });
          gsap.to(char, { opacity: 1, duration: 0.06, delay: 0.12 });
        } else if (type === 1) {
          gsap.to(char, { x: (Math.random() - 0.5) * 6, opacity: 0.2, duration: 0.03 });
          gsap.to(char, { x: 0, opacity: 1, duration: 0.08, delay: 0.06 });
        } else if (type === 2) {
          gsap.to(char, { color: "#00f2fe", duration: 0.02 });
          gsap.to(char, { color: "#a855f7", duration: 0.03, delay: 0.04 });
          gsap.to(char, { color: "", duration: 0.06, delay: 0.1 });
        } else {
          gsap.to(char, { opacity: 0.1, scale: 0.8, duration: 0.02 });
          gsap.to(char, { opacity: 1, scale: 1, duration: 0.07, delay: 0.05 });
        }
      });

      setTimeout(glitch, 1500 + Math.random() * 4500);
    };

    setTimeout(glitch, 2000);
  }

  glitchHeroTitle() {
    const chars = document.querySelectorAll("#hero-main-title .char-span");
    if (!chars.length) return;

    const glitch = () => {
      const count = 1 + Math.floor(Math.random() * 3);
      const indices = new Set();
      while (indices.size < count) {
        indices.add(Math.floor(Math.random() * chars.length));
      }

      indices.forEach(idx => {
        const char = chars[idx];
        const shadowCyan = "2px -1px 0 rgba(0, 242, 254, 0.8)";
        const shadowPurple = "-2px 1px 0 rgba(168, 85, 247, 0.8)";
        const combinedShadow = shadowCyan + ", " + shadowPurple + ", 0 0 15px rgba(0, 242, 254, 0.3)";

        const tl = gsap.timeline();
        tl.to(char, { 
          textShadow: combinedShadow, 
          filter: "blur(3px)",
          x: (Math.random() - 0.5) * 4,
          duration: 0.05 
        })
        .to(char, { 
          textShadow: "none", 
          filter: "blur(0px)",
          x: 0,
          duration: 0.08, 
          delay: 0.06 
        });
      });

      setTimeout(glitch, 2000 + Math.random() * 4000);
    };

    setTimeout(glitch, 3000);
  }

  staggerCards(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const cards = section.querySelectorAll(".metric-card");
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3
      }
    );
  }

  staggerShowcasePanels(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const panel = section.querySelector(".showcase-code-panel");
    const desc = section.querySelector(".about-text");

    if (panel) {
      gsap.fromTo(panel,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out", delay: 0.15 }
      );
    }
    if (desc) {
      gsap.fromTo(desc,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.25 }
      );
    }
  }

  staggerProjectRows(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const rows = section.querySelectorAll(".project-row");
    if (!rows.length) return;

    gsap.fromTo(rows,
      { opacity: 0, x: -25 },
      {
        opacity: 1, x: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.3
      }
    );
  }

  staggerAboutSpecs(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const items = section.querySelectorAll(".spec-item");
    if (!items.length) return;

    gsap.fromTo(items,
      { opacity: 0, y: 15 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.3
      }
    );
  }

  resetSection(sectionId) {
    this.animatedSections.delete(sectionId);
    const section = document.getElementById(sectionId);
    if (!section) return;

    const targets = section.querySelectorAll(
      ".mono.sm, .project-name, .spec-value, .hero-title, .about-title, .footer-heading"
    );
    targets.forEach(t => {
      t.classList.remove("scramble-revealed");
      const chars = t.querySelectorAll(".char-span");
      chars.forEach(c => {
        c.style.opacity = "0";
        c.style.color = "";
        c.style.webkitTextFillColor = "";
        c.style.textShadow = "";
      });
    });

    const words = section.querySelectorAll(".revealed-word");
    words.forEach(w => w.classList.remove("revealed-word"));
  }

  animateSectionIn(sectionId, force = false) {
    if (force) {
      this.resetSection(sectionId);
    }
    if (this.animatedSections.has(sectionId)) return;
    this.animatedSections.add(sectionId);

    this.staggerCards(sectionId);
    this.staggerShowcasePanels(sectionId);
    this.staggerProjectRows(sectionId);
    this.staggerAboutSpecs(sectionId);

    this.scrambleRevealText(sectionId);
  }

  scrambleRevealText(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const targets = section.querySelectorAll(
      ".mono.sm, .project-name, .spec-value, .hero-title, .about-title, .footer-heading"
    );

    targets.forEach(target => {
      if (target.classList.contains("scramble-revealed")) return;
      target.classList.add("scramble-revealed");

      const chars = target.querySelectorAll(".char-span");
      if (chars.length) {
        gsap.set(chars, { opacity: 0, x: 0, y: 0, scale: 1 });

        const glyphs = ["0", "1", "X", "Y", "Z", "A", "B", "C", "░", "▒", "▓", "█", "▄", "▀", "▲", "▼", "◀", "▶", "◆", "◇", "#", "$", "%", "&", "@", "*", "+", "-", "=", "?", "/", "\\", "!"];

        chars.forEach((char, idx) => {
          const originalChar = char.getAttribute("data-char") || char.textContent;

          if (originalChar === " " || originalChar === "\u00a0" || originalChar === "&nbsp;") {
            gsap.set(char, { opacity: 1, y: 0 });
            return;
          }

          const obj = { progress: 0 };
          gsap.to(obj, {
            progress: 1,
            duration: 0.75,
            delay: idx * 0.015,
            ease: "power1.out",
            onStart: () => {
              gsap.set(char, { 
                opacity: 1, 
                y: 0, 
                color: "#ffffff",
                webkitTextFillColor: "#ffffff",
                textShadow: "none"
              });
            },
            onUpdate: () => {
              if (obj.progress < 0.72) {
                char.innerText = glyphs[Math.floor(Math.random() * glyphs.length)];
                char.style.color = "#94a3b8"; 
                char.style.webkitTextFillColor = "#94a3b8";
              } else {
                char.innerText = originalChar;
                char.style.color = "";
                char.style.webkitTextFillColor = "";
                char.style.textShadow = "";
              }
            },
            onComplete: () => {
              char.innerText = originalChar;
              char.style.color = "";
              char.style.webkitTextFillColor = "";
              char.style.textShadow = "";
            }
          });
        });
      }
    });

    const paragraphWords = section.querySelectorAll(".about-text .word-span, .footer-credits .word-span, .metric-label .word-span");
    if (paragraphWords.length) {
      if (!paragraphWords[0].classList.contains("revealed-word")) {
        paragraphWords.forEach(w => w.classList.add("revealed-word"));

        gsap.fromTo(paragraphWords,
          { opacity: 0, scale: 0.96, y: 0 },
          {
            opacity: 1, scale: 1, y: 0,
            duration: 0.5,
            stagger: 0.01,
            ease: "power2.out",
            overwrite: "auto"
          }
        );
      }
    }
  }

  flickerReveal(elementSelector, delay = 0) {
    const element = document.querySelector(elementSelector);
    if (!element) return;

    const tl = gsap.timeline({ delay });
    tl.to(element, { opacity: 0.1, duration: 0.05 })
      .to(element, { opacity: 0.6, duration: 0.03 })
      .to(element, { opacity: 0.2, duration: 0.08 })
      .to(element, { opacity: 0.9, duration: 0.04 })
      .to(element, { opacity: 0.4, duration: 0.06 })
      .to(element, { opacity: 1, duration: 0.1 });
  }
}
