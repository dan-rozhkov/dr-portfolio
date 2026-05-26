const cursor = document.querySelector(".cursor");
const cursorLabel = cursor?.querySelector("span");
const hoverTargets = document.querySelectorAll("[data-cursor]");

if (cursor && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursor.classList.add("is-visible");
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  window.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible");
  });

  hoverTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => {
      cursorLabel.textContent = target.dataset.cursor || "VIEW";
      cursor.classList.add("is-active");
    });

    target.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-active");
    });
  });
}

document.querySelectorAll(".extra-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".extra-tab").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
  });
});

const contactSection = document.querySelector("#contact");

if (contactSection) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      document.body.classList.toggle("contact-active", entry.isIntersecting);
    },
    { threshold: 0.45 }
  );

  observer.observe(contactSection);
}
