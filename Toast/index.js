class Toast {
	#toastTypes = ["info", "error", "ok", "warning", "none", "important"]
	
	#toastDataAttribute = {
		data: "data-toast",
		type: "data-toast-type"
	};

	#toastElements = [
		{
			"prefix",
			
		},
		["suffix"],
		["content", "p"]
	]

	#attributes = [
		["role", "status"],
		["aria-live", "polite"],
		["class", "toast"]
	];

	#animatedValues = [
		"opacity",
		"visibility",
		"bottom",
		"background-color"
	]

	#timeout = null;
	#showing = false;

	/**
	 * 
	 * @param {HTMLDivElement} toastContainer 
	 * @param {{ triggers: HTMLElement[], animationSpeed: number, hideDelay: number }} options 
	 */
	constructor(toastContainer, options = null) {
		this.container = toastContainer;
		this.options = options;
		this.#initialize();
	}

	#initialize() {
		this.#setAttributes();
		this.container.style.transition = this.#animatedValues.map((val) => `${val} ${this.options?.animationSpeed ?? 500}ms ease-in-out`).join(",");
		this.#injectContent();
		this.#setupTriggers();
	}

	#setAttributes() {
		this.#attributes.forEach(([attribute, value]) => this.container.setAttribute(attribute, value));
	}

	#injectContent() {
		const $timer = document.createElement("div");
		const $toastElements = this.#toastElements.map((el) => {
			const $el = document.createElement(el[1]);
			$el.className = `toast-${el[0]}`
			return {
				$element: $el,
				name: el[0]
			}
		})

		$timer.id = "toast-timer";
		$timer.style.animationDuration = `${(this.options.hideDelay ?? 2000) / 1.15}ms`;
		

		suffix.addEventListener("click", () => {
			this.#hide(true);
		})

		this.container.addEventListener("mouseenter", () => {
			clearTimeout(this.#timeout);
			this.#timer("stop");
		});
		this.container.addEventListener("mouseleave", () => {
			clearTimeout(this.#timeout);
			this.#timer("run");
			this.#hide();
		});

		$toastElements.forEach((el) => this.container.appendChild(el.$element));
		this.container.appendChild($timer);
	}

	#setupTriggers() {
		const {
			triggers
		} = this.options;
		if (!triggers || triggers.length < 1) return;
		triggers.forEach(trigger => {
			const toastData = trigger.getAttribute(this.#toastDataAttribute.data);
			const toastDataType = trigger.getAttribute(this.#toastDataAttribute.type);
			if (!toastData || toastData === "" || !toastDataType || toastDataType === "") {
				console.warn("No value provided in 'data-toast' or 'data-toast-type' attribute on the trigger element");
			} else {
				trigger.addEventListener('click', () => {
					this.show(toastData, toastDataType)
				});
			}
		});
	}

	#setState(state) {
		this.#showing = state;
	}

	/**
	 * @description Adds or deletes a class based on params provided
	 * @param {HTMLElement} el 
	 * @param {string} cls
	 * @param {string} clean
	 * @returns {string}
	 */
	#toggleClasses(el, options = {
		add: "",
		del: ""
	}) {
		const {
			add = "", del = ""
		} = options;
		const classesToAdd = add ? ` ${add}` : "";
		const classesToDelete = del ? new RegExp(`\\b${del}\\b`, "g") : null;

		el.className = (el.className.replace(classesToDelete, "").trim() + classesToAdd).trim();
	}

	#timer(state = "run") {
		const $timer = this.container.children[3];
		$timer.style.animationName = state === "run" ? "fullWidth" : "none";
	}

	async #hide(restart = false) {
		return new Promise(resolve => {
			if (this.#timeout) {
				clearTimeout(this.#timeout);
				this.#timer("stop");
				this.#timeout = null;
			}
			this.#timer("run");
			this.#timeout = setTimeout(() => {
				this.#toggleClasses(this.container, {
					del: "show"
				});
				this.#setState(false);
				this.#timeout = null;
				if (!restart) resolve();
				this.#timer("stop");
				setTimeout(() => {
					resolve();
				}, this.options?.animationSpeed ?? 500);
			}, restart ? 0 : this.options?.hideDelay ?? 2000);
		});
	}

	/**
	 * 
	 * @param {string} text 
	 * @param {"info" | "ok" | "important" | "error" | "warning" | "none"} type 
	 */
	async show(text, type = "info") {
		console.log(`Showing toast with content '${text}' and type '${type}'`);
		if (this.#showing) await this.#hide(true);
		this.#setState(true);
		this.#toggleClasses(this.container.children[0], {
			add: type,
			del: this.#toastTypes.join("|")
		})
		this.container.children[1].textContent = text;
		this.#toggleClasses(this.container, {
			add: "show"
		});
		await this.#hide();
	}
}




let toast;

function initForm() {
	function showToast(form) {
		const formData = new FormData(form);
		const data = Object.fromEntries(formData);

		toast.show(data["toast-text"], data["toast-type-select"])
	}

	document.getElementById("toast-form").addEventListener("submit", function (e) {
		e.preventDefault();

		showToast(e.target)
	});
}

document.addEventListener("DOMContentLoaded", function () {
	const toastInstance = new Toast(
		document.getElementById("toast"), {
			triggers: document.querySelectorAll("button.toast-trigger"),
			animationSpeed: 250
		}
	);

	toast = toastInstance
	initForm();
	toast.show("Welcome! Click the buttons to show different types of toast 🙂", "info");

});