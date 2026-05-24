// Wrap everything in an IIFE to avoid global scope pollution and ensure proper timing
;(() => {
  class TextScramble {
    constructor(el) {
      this.el = el
      this.chars = "!<>-_\\/[]{}—=+*^?#________ "
      this.update = this.update.bind(this)
    }

    setText(newText) {
      const oldText = this.el.innerText
      const length = Math.max(oldText.length, newText.length)
      const promise = new Promise((resolve) => (this.resolve = resolve))
      this.queue = []

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || ""
        const to = newText[i] || ""
        const start = Math.floor(Math.random() * 40)
        const end = start + Math.floor(Math.random() * 40)
        this.queue.push({ from, to, start, end })
      }

      cancelAnimationFrame(this.frameRequest)
      this.frame = 0
      this.update()
      return promise
    }

    update() {
      let output = ""
      let complete = 0

      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i]

        if (this.frame >= end) {
          complete++
          output += to
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar()
            this.queue[i].char = char
          }
          output += `<span class="scramble-char" style="color: #ef4444;">${char}</span>`
        } else {
          output += from
        }
      }

      this.el.innerHTML = output

      if (complete === this.queue.length) {
        this.resolve()
      } else {
        this.frameRequest = requestAnimationFrame(this.update)
        this.frame++
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)]
    }
  }

  // Initialize scramblers
  const scramblers = {}

  function initScrambler(id) {
    if (!scramblers[id]) {
      const el = document.getElementById(id)
      if (el) {
        scramblers[id] = new TextScramble(el)
      }
    }
  }

  function scrambleText(elementId, finalText) {
    initScrambler(elementId)
    if (scramblers[elementId]) {
      scramblers[elementId].setText(finalText)
    }
  }

  // Improved scramble effect
  function startScrambleEffect() {
    const mainTextElement = document.getElementById("mainText")
    if (mainTextElement) {
      mainTextElement.textContent = "CELEBRATING JAPANS CULTURE"

      setTimeout(() => {
        scrambleText("mainText", "CELEBRATING JAPANS CULTURE")
      }, 500)
    }
  }

  // SIMPLE CLEAN CURSOR - Circle with center dot
  class SimpleCursor {
    constructor() {
      this.cursor = document.querySelector("#cursor")
      this.cursorCircle = this.cursor?.querySelector(".cursor__circle")
      this.cursorLabel = document.getElementById("cursorLabel")

      if (!this.cursor || !this.cursorCircle) return

      // Mouse and cursor positions
      this.mouse = { x: -100, y: -100 }
      this.pos = { x: 0, y: 0 }

      // Smooth settings
      this.speed = 0.08
      this.scale = 1
      this.targetScale = 1

      // Drag scroll variables
      this.isDragging = false
      this.startY = 0
      this.scrollStart = 0
      this.dragThreshold = 8
      this.hasMoved = false
      this.canDrag = true

      this.init()
    }

    init() {
      // Show cursor only on desktop
      if (window.innerWidth > 768) {
        this.cursor.style.display = "block"
        this.bindEvents()
        this.animate()
      }
    }

    bindEvents() {
      document.addEventListener("mousemove", (e) => this.updateMousePosition(e))
      document.addEventListener("mousedown", (e) => this.startDrag(e))
      document.addEventListener("mouseup", () => this.endDrag())
      document.addEventListener("mousemove", (e) => this.handleDrag(e))

      this.setupCursorModifiers()

      document.addEventListener("contextmenu", (e) => {
        if (this.isDragging) e.preventDefault()
      })
    }

    updateMousePosition(e) {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    }

    startDrag(e) {
      const clickableElements = 'a, button, input, textarea, select, .navbar, .btn-1, [role="button"]'
      if (e.target.closest(clickableElements)) {
        this.canDrag = false
        return
      }

      this.canDrag = true
      this.isDragging = true
      this.startY = e.clientY
      this.scrollStart = window.scrollY
      this.hasMoved = false

      // Visual feedback - add dragging class to cursor
      this.cursor.classList.add("dragging")
      this.targetScale = 1.2

      if (this.cursorLabel) {
        this.cursorLabel.innerText = "drag"
      }

      e.preventDefault()
    }

    handleDrag(e) {
      if (!this.isDragging || !this.canDrag) return

      const deltaY = e.clientY - this.startY

      if (!this.hasMoved && Math.abs(deltaY) > this.dragThreshold) {
        this.hasMoved = true
        document.body.classList.add("dragging")
      }

      if (this.hasMoved) {
        const newScrollY = this.scrollStart - deltaY
        const clampedScrollY = Math.max(
          0,
          Math.min(newScrollY, document.documentElement.scrollHeight - window.innerHeight),
        )

        window.scrollTo({
          top: clampedScrollY,
          behavior: "auto",
        })

        if (this.cursorLabel) {
          this.cursorLabel.innerText = deltaY < 0 ? "up" : "down"
        }
      }
    }

    endDrag() {
      if (!this.isDragging) return

      this.isDragging = false
      this.hasMoved = false
      this.canDrag = true
      this.targetScale = 1

      // Remove dragging class from cursor
      this.cursor.classList.remove("dragging")

      if (this.cursorLabel) {
        this.cursorLabel.innerText = "scroll"
      }

      document.body.classList.remove("dragging")
    }

    setupCursorModifiers() {
      const interactiveElements = document.querySelectorAll('a, button, .btn-1, [role="button"], [cursor-class]')

      interactiveElements.forEach((element) => {
        element.addEventListener("mouseenter", () => {
          this.targetScale = 1.4
          this.cursor.classList.add("hover")

          if (this.cursorLabel) {
            this.cursorLabel.innerText = "click"
          }

          const cursorClass = element.getAttribute("cursor-class")
          if (cursorClass) {
            this.cursor.classList.add(cursorClass)
          }
        })

        element.addEventListener("mouseleave", () => {
          this.targetScale = 1
          this.cursor.classList.remove("hover")

          if (this.cursorLabel) {
            this.cursorLabel.innerText = "scroll"
          }

          const cursorClass = element.getAttribute("cursor-class")
          if (cursorClass) {
            this.cursor.classList.remove(cursorClass)
          }
        })
      })
    }

    animate() {
      // Smooth cursor following
      const diffX = this.mouse.x - this.pos.x
      const diffY = this.mouse.y - this.pos.y

      this.pos.x += diffX * this.speed
      this.pos.y += diffY * this.speed

      this.scale += (this.targetScale - this.scale) * 0.08

      // Apply transforms
      this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`
      this.cursorCircle.style.transform = `scale(${this.scale})`

      requestAnimationFrame(() => this.animate())
    }
  }

  // Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal")
        }
      })
    },
    {
      threshold: 0.1,
    },
  )

  // Form validation and modal - FIXED VERSION
  function initializeFormValidation() {
    const form = document.getElementById("signupForm")
    const fullName = document.getElementById("fullName")
    const email = document.getElementById("email")
    const password = document.getElementById("inputPassword4")
    const confirmPassword = document.getElementById("confirmPassword")
    const country = document.getElementById("country")
    const maleGender = document.getElementById("male")
    const femaleGender = document.getElementById("female")
    const otherGender = document.getElementById("other-gender") // Last radio button
    const feedback = document.getElementById("feedback")
    const satisfaction = document.getElementById("satisfaction")
    const terms = document.getElementById("terms")
    const submitButton = form?.querySelector('button[type="submit"]') // Get the submit button
    const feedbackCharCount = document.getElementById("feedbackCharCount") // ADDED: Character counter element

    // Check if all required elements exist
    if (
      !form ||
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !country ||
      !maleGender ||
      !femaleGender ||
      !otherGender ||
      !feedback ||
      !satisfaction ||
      !terms ||
      !submitButton ||
      !feedbackCharCount
    ) {
      // This means the form elements are not present on the current page (e.g., index.html or content.html)
      return
    }

    // Check if Bootstrap is available
    if (typeof window.bootstrap === "undefined") {
      // console.error("Bootstrap is not loaded. Make sure Bootstrap JS is loaded before this script.")
      return
    }

    // Initialize the modal
    let successModal
    try {
      const modalElement = document.getElementById("successModal")
      if (modalElement) {
        successModal = new window.bootstrap.Modal(modalElement)
      } else {
        // console.error("Success modal element not found")
        return
      }
    } catch (error) {
      // console.error("Error initializing Bootstrap modal:", error)
      return
    }

    // Custom password confirmation validation
    function validatePasswordMatch() {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords do not match")
        confirmPassword.classList.add("is-invalid")
        confirmPassword.classList.remove("is-valid")
      } else {
        confirmPassword.setCustomValidity("")
        confirmPassword.classList.remove("is-invalid")
        confirmPassword.classList.add("is-valid")
      }
    }

    // Add event listeners for password matching
    password.addEventListener("input", validatePasswordMatch)
    confirmPassword.addEventListener("input", validatePasswordMatch)

    // ADDED: Character counter for feedback textarea
    feedback.addEventListener("input", () => {
      const currentLength = feedback.value.length
      feedbackCharCount.textContent = `${currentLength} characters`
    })
    // Initialize character count on load
    feedback.dispatchEvent(new Event("input"))

    // Auto-tab functionality on Enter key press for specific elements
    // Define the sequence of focusable elements
    const focusSequence = [
      fullName,
      email,
      password,
      confirmPassword,
      country,
      maleGender, // Start of radio group
      feedback,
      satisfaction,
      terms,
      submitButton,
    ]

    focusSequence.forEach((element, index) => {
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          // Special handling for submit button: allow native submit event to fire
          if (element === submitButton) {
            // Do not prevent default here, let the form's submit event listener handle it
            return
          }

          // Prevent default Enter behavior for all other elements
          event.preventDefault()

          // Handle specific element behaviors
          if (element === terms) {
            // Toggle checkbox state on Enter
            element.checked = !element.checked
            // Visually update validation state if needed (Bootstrap's validation might handle this on blur/submit)
            if (element.checkValidity()) {
              element.classList.remove("is-invalid")
              element.classList.add("is-valid")
            } else {
              element.classList.remove("is-valid")
              element.classList.add("is-invalid")
            }
          } else if (element === maleGender || element === femaleGender || element === otherGender) {
            // For radio buttons, ensure it's selected and then move focus
            element.checked = true // Select the radio button
            // Find the next element in the sequence after the radio group
            const nextElementIndex = focusSequence.indexOf(feedback) // Find index of feedback
            if (focusSequence[nextElementIndex]) {
              focusSequence[nextElementIndex].focus()
            }
            return // Exit after handling radio button
          }

          // Move focus to the next element in the sequence
          const nextElement = focusSequence[index + 1]
          if (nextElement) {
            nextElement.focus()
          }
        }
      })
    })

    // Form submit handler
    form.addEventListener(
      "submit",
      (event) => {
        // Always prevent default submission to handle it with JavaScript
        event.preventDefault()
        event.stopPropagation()

        // Apply was-validated class immediately to trigger Bootstrap's validation styles
        form.classList.add("was-validated")

        validatePasswordMatch() // Still call this for password specific logic

        if (form.checkValidity()) {
          // Form is valid - show success modal
          successModal.show()
          form.reset()
          form.classList.remove("was-validated") // Remove after successful submission

          // Reset all validation classes
          const inputs = form.querySelectorAll("input, select, textarea") // Ensure textarea is included here too
          inputs.forEach((input) => {
            input.classList.remove("is-valid", "is-invalid")
          })
          feedbackCharCount.textContent = `0 characters` // Reset character count
        }
      },
      false,
    )

    // Real-time validation for better UX
    const inputs = form.querySelectorAll("input, select, textarea")
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        if (this.checkValidity()) {
          this.classList.remove("is-invalid")
          this.classList.add("is-valid")
        } else {
          this.classList.remove("is-valid")
          this.classList.add("is-invalid")
        }
      })
    })
  }

  // ADDED: Data for dynamically rendered related links
  const relatedLinksData = [
    { name: "Japan National Tourism Organization", url: "https://www.japan.travel/" },
    { name: "Japanese Cultural Heritage Online", url: "https://www.bunka.go.jp/english/" },
    { name: "Learn Japanese Culture", url: "https://www.japan-guide.com/e/e622.html" },
  ]

  // ADDED: Function to dynamically render related links
  function renderRelatedLinks() {
    const container = document.getElementById("related-links-container")
    if (!container) {
      return
    }
    container.innerHTML = "" // Clear existing content

    relatedLinksData.forEach((link) => {
      const listItem = document.createElement("li")
      listItem.className = "list-group-item bg-dark text-white"
      listItem.innerHTML = `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-decoration-none" style="color: #e74c3c;">${link.name}</a>`
      container.appendChild(listItem)
    })

    // Re-observe newly added elements for reveal effect
    const newHiddenElements = container.querySelectorAll(".hidden-on-load")
    newHiddenElements.forEach((el) => observer.observe(el))
  }

  // Main initialization function
  function initialize() {
    // Initialize cursor
    new SimpleCursor()

    // Initialize intersection observer
    const hiddenElements = document.querySelectorAll(".hidden-on-load")
    hiddenElements.forEach((el) => observer.observe(el))

    // Start scramble effect
    startScrambleEffect()

    // Initialize form validation (only runs if form elements exist)
    initializeFormValidation()

    // ADDED: Render related links dynamically
    renderRelatedLinks()

    // Font size buttons - MOVED HERE
    let fontSize = 100

    function applyFontSize() {
      document.body.style.fontSize = fontSize + "%"
    }

    const increaseFontBtn = document.getElementById("increaseFontBtn")
    const decreaseFontBtn = document.getElementById("decreaseFontBtn")

    if (increaseFontBtn) {
      increaseFontBtn.addEventListener("click", () => {
        fontSize += 10
        applyFontSize()
      })
    }

    if (decreaseFontBtn) {
      decreaseFontBtn.addEventListener("click", () => {
        if (fontSize > 50) {
          fontSize -= 10
          applyFontSize()
        }
      })
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize)
  } else {
    initialize()
  }

  // Additional initialization on window load
  window.addEventListener("load", () => {
    startScrambleEffect()
  })

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar")
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled")
      } else {
        navbar.classList.remove("scrolled")
      }
    }
  })

  // Handle window resize
  window.addEventListener("resize", () => {
    const cursor = document.querySelector("#cursor")
    if (cursor) {
      if (window.innerWidth <= 768) {
        cursor.style.display = "none"
      } else {
        cursor.style.display = "block"
      }
    }
  })
})() // End of IIFE
