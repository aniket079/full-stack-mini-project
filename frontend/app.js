const API_BASE_URL = "https://dummyjson.com";

const signinTab = document.querySelector("#signin-tab");
const registerTab = document.querySelector("#register-tab");
const signinForm = document.querySelector("#signin-form");
const registerForm = document.querySelector("#register-form");
const formTitle = document.querySelector("#form-title");
const formDescription = document.querySelector("#form-description");
const formMessage = document.querySelector("#form-message");


console.log("registerTab", registerTab);
function showMessage(message, state = "success") {
    formMessage.textContent = message;
    formMessage.dataset.state = state;
    formMessage.hidden = false;
}

function clearMessage() {
    formMessage.textContent = "";
    formMessage.hidden = true;
    delete formMessage.dataset.state;
}

function setMode(mode) {
    const isSignin = mode === "signin";
    signinTab.classList.toggle("is-active", isSignin);
    registerTab.classList.toggle("is-active", !isSignin);
    signinTab.setAttribute("aria-selected", String(isSignin));
    registerTab.setAttribute("aria-selected", String(!isSignin));
    signinForm.hidden = !isSignin;
    registerForm.hidden = isSignin;
    formTitle.textContent = isSignin ? "Welcome back" : "A fresh start";
    formDescription.textContent = isSignin
        ? "Sign in to pick up where you left off."
        : "Create an account and make yourself at home.";
    clearMessage();
}

async function postJson(path, payload) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "The request could not be completed.");
    }
    return data;
}

function setSubmitting(form, isSubmitting, label) {
    const button = form.querySelector(".submit-button");
    button.disabled = isSubmitting;
    button.querySelector("span").textContent = isSubmitting ? "Please wait..." : label;
}

signinTab.addEventListener("click", () => setMode("signin"));
registerTab.addEventListener("click", () => setMode("register"));

signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    if (!signinForm.reportValidity()) return;

    const formData = new FormData(signinForm);
    const payload = {
        username: formData.get("username").trim(),
        password: formData.get("password"),
        expiresInMins: 30,
    };

    setSubmitting(signinForm, true, "Sign in");
    try {
        const user = await postJson("/auth/login", payload);
        showMessage(`Welcome back, ${user.firstName || user.username}. You are signed in.`);
    } catch (error) {
        showMessage(error.message || "Unable to connect. Please try again.", "error");
    } finally {
        setSubmitting(signinForm, false, "Sign in");
    }
});

registerForm.addEventListener("submit", async (event) => {
    console.log("Event listerner form register form started");
    event.preventDefault();
    clearMessage();

    if (!registerForm.reportValidity()) return;

    const formData = new FormData(registerForm);

    console.log("Formdata", formData.get(""));

    const password = formData.get("password");
    if (password !== formData.get("confirmPassword")) {
        showMessage("Those passwords do not match.", "error");
        registerForm.elements.confirmPassword.focus();
        return;
    }



    const payload = {
        firstName: formData.get("firstName").trim(),
        lastName: formData.get("lastName").trim(),
        email: formData.get("email").trim(),
        username: formData.get("username").trim(),
        password,
    };

    console.log("payload", payload);

    setSubmitting(registerForm, true, "Create account");
    try {
        const user = await postJson("/users/add", payload);
        showMessage(`Thanks, ${user.firstName}. The demo API accepted the request, but does not save new accounts.`);
    } catch (error) {
        showMessage(error.message || "Unable to connect. Please try again.", "error");
    } finally {
        setSubmitting(registerForm, false, "Create account");
    }
});

document.querySelector("#demo-login").addEventListener("click", () => {
    signinForm.elements.username.value = "emilys";
    signinForm.elements.password.value = "emilyspass";
    setMode("signin");
    signinForm.elements.username.focus();
});
