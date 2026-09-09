const EVENT_DATE = new Date("2026-10-24T21:00:00-03:00");
const unitIds = ["days", "hours", "minutes", "seconds"];
const units = unitIds.map((id) => document.getElementById(id));

const entryScreen = document.getElementById("entryScreen");
const enterWithMusic = document.getElementById("enterWithMusic");
const enterWithoutMusic = document.getElementById("enterWithoutMusic");
const invitationAudio = document.getElementById("invitationAudio");
const audioToggle = document.getElementById("audioToggle");

invitationAudio.volume = 0.42;

function syncAudioToggle() {
  const isPlaying = !invitationAudio.paused;
  audioToggle.classList.toggle("is-playing", isPlaying);
  audioToggle.setAttribute("aria-pressed", String(isPlaying));
  audioToggle.setAttribute("aria-label", isPlaying ? "Apagar música" : "Encender música");
}

function revealInvitation() {
  document.body.classList.remove("entry-open");
  entryScreen.classList.add("is-leaving");
  audioToggle.hidden = false;
  window.setTimeout(() => { entryScreen.hidden = true; }, 560);
}

enterWithMusic.addEventListener("click", () => {
  const playback = invitationAudio.play();
  revealInvitation();
  if (playback) playback.catch(syncAudioToggle);
});

enterWithoutMusic.addEventListener("click", () => {
  invitationAudio.pause();
  invitationAudio.currentTime = 0;
  revealInvitation();
});

audioToggle.addEventListener("click", () => {
  if (invitationAudio.paused) {
    const playback = invitationAudio.play();
    if (playback) playback.catch(syncAudioToggle);
  } else {
    invitationAudio.pause();
  }
});

invitationAudio.addEventListener("play", syncAudioToggle);
invitationAudio.addEventListener("pause", syncAudioToggle);

const invitationPanels = [...document.querySelectorAll(".invitation > .panel")];
const panelObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("reveal-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

invitationPanels.slice(1).forEach((panel) => {
  panel.classList.add("reveal-ready");
  panelObserver.observe(panel);
});

function updateCountdown() {
  const remaining = Math.max(0, EVENT_DATE.getTime() - Date.now());
  const values = [
    Math.floor(remaining / 86400000),
    Math.floor((remaining % 86400000) / 3600000),
    Math.floor((remaining % 3600000) / 60000),
    Math.floor((remaining % 60000) / 1000),
  ];

  values.forEach((value, index) => {
    units[index].textContent = String(value).padStart(2, "0");
  });
}

function downloadCalendarEvent() {
  const event = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mis XV Nela//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:mis-xv-nela-20261024@invitacion",
    "DTSTAMP:20260827T190000Z",
    "DTSTART:20261025T000000Z",
    "DTEND:20261025T060000Z",
    "SUMMARY:Mis XV Nela",
    "DESCRIPTION:Celebramos los 15 de Nela.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([event], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Mis-XV-Nela.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

document.getElementById("calendarButton").addEventListener("click", downloadCalendarEvent);

const locationModal = document.getElementById("locationModal");
const locationTrigger = document.getElementById("locationTrigger");
const locationClose = document.getElementById("locationClose");
const copyAddress = document.getElementById("copyAddress");
const copyStatus = document.getElementById("copyStatus");
const venueAddress = "Mariano Pelliza 310, Olivos, Provincia de Buenos Aires";

locationTrigger.addEventListener("click", () => locationModal.showModal());
locationClose.addEventListener("click", () => locationModal.close());

locationModal.addEventListener("click", (event) => {
  if (event.target === locationModal) locationModal.close();
});

copyAddress.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(venueAddress);
    copyStatus.textContent = "Dirección copiada";
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = venueAddress;
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    document.execCommand("copy");
    temporaryInput.remove();
    copyStatus.textContent = "Dirección copiada";
  }
  setTimeout(() => { copyStatus.textContent = ""; }, 2500);
});

const giftsSection = document.getElementById("giftsSection");
const giftsPearl = document.getElementById("giftsPearl");
const giftsDetails = document.getElementById("giftsDetails");
const giftsModal = document.getElementById("giftsModal");
const giftsModalClose = document.getElementById("giftsModalClose");
const copyGiftAlias = document.getElementById("copyGiftAlias");
const giftAlias = document.getElementById("giftAlias");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function finishGiftsOpening() {
  giftsSection.classList.remove("is-opening");
  giftsSection.classList.add("is-open");
  giftsDetails.tabIndex = 0;
}

function openGiftsSection() {
  if (giftsSection.classList.contains("is-opening") || giftsSection.classList.contains("is-open")) return;

  giftsSection.classList.add("is-opening");
  giftsPearl.disabled = true;

  if (reducedMotion.matches) {
    finishGiftsOpening();
  } else {
    window.setTimeout(finishGiftsOpening, 1220);
  }
}

giftsPearl.addEventListener("click", openGiftsSection, { once: true });
giftsDetails.addEventListener("click", () => giftsModal.showModal());
giftsModalClose.addEventListener("click", () => giftsModal.close());

giftsModal.addEventListener("click", (event) => {
  if (event.target === giftsModal) giftsModal.close();
});

copyGiftAlias.addEventListener("click", async () => {
  const alias = giftAlias.textContent.trim();
  try {
    await navigator.clipboard.writeText(alias);
  } catch {
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = alias;
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    document.execCommand("copy");
    temporaryInput.remove();
  }

  copyGiftAlias.textContent = "Alias copiado";
  window.setTimeout(() => { copyGiftAlias.textContent = "Copiar alias"; }, 2400);
});

updateCountdown();
setInterval(updateCountdown, 1000);
