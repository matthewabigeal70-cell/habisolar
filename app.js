/* ==========================================================================
   HABI SOLAR - Application & Interaction Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // Sticky Header & Scroll-Active Nav Links
    // ==========================================================================
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-drawer ul li a');

    window.addEventListener('scroll', () => {
        // Sticky Header Effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link Highlight on Scroll
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(a => {
            a.classList.remove('active');
            const href = a.getAttribute('href');
            if (href === '#' && current === 'home') {
                a.classList.add('active');
            } else if (href.substring(1) === current) {
                a.classList.add('active');
            }
        });
    });

    // ==========================================================================
    // Always-Hamburger Drawer Navigation Toggle
    // ==========================================================================
    const hamburger  = document.getElementById('hamburger-menu');
    const navDrawer  = document.getElementById('nav-drawer');
    const navOverlay = document.getElementById('nav-overlay');

    const openDrawer = () => {
        hamburger.classList.add('open');
        navDrawer.classList.add('open');
        navOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden'; // prevent scroll while drawer open
    };

    const closeDrawer = () => {
        hamburger.classList.remove('open');
        navDrawer.classList.remove('open');
        navOverlay.classList.remove('visible');
        document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
        navDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    // Close drawer when clicking the overlay backdrop
    navOverlay.addEventListener('click', closeDrawer);

    // Close drawer when a nav link is clicked
    navLinks.forEach(link => link.addEventListener('click', closeDrawer));
    const drawerCta = document.querySelector('.nav-drawer-cta');
    if (drawerCta) drawerCta.addEventListener('click', closeDrawer);

    // ==========================================================================
    // Hero Background Image Slideshow
    // ==========================================================================
    const slides = document.querySelectorAll('.hero-bg-slideshow .slide');
    const dots   = document.querySelectorAll('.slide-dots .dot');
    let currentSlide = 0;
    let slideshowTimer = null;

    const goToSlide = (index) => {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    };

    const advanceSlide = () => goToSlide(currentSlide + 1);

    const startSlideshow = () => {
        slideshowTimer = setInterval(advanceSlide, 4000);
    };

    const restartSlideshow = () => {
        clearInterval(slideshowTimer);
        startSlideshow();
    };

    // Dot click — jump to a specific slide and reset auto-timer
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const target = parseInt(dot.getAttribute('data-slide'));
            goToSlide(target);
            restartSlideshow();
        });
    });

    if (slides.length > 0) startSlideshow();


    // ==========================================================================
    // Live Solar Output Simulator (Floating Card Micro-Fluctuation)
    // ==========================================================================
    const liveOutputText = document.getElementById('live-output-text');
    if (liveOutputText) {
        let baseOutput = 5.8;
        setInterval(() => {
            // Micro-fluctuate base output by +/- 0.15 kW to make page feel interactive
            const fluctuation = (Math.random() * 0.3 - 0.15);
            const currentOutput = Math.max(1.2, baseOutput + fluctuation); // Never drop below 1.2 during daylight
            liveOutputText.textContent = `Generating ${currentOutput.toFixed(2)} kW`;
            baseOutput = parseFloat(currentOutput.toFixed(2));
        }, 3000);
    }

    // ==========================================================================
    // Count-Up Animation for Hero Stats
    // ==========================================================================
    const counters = document.querySelectorAll('.counter');
    const countSpeed = 200; // lower number = faster

    const startCounting = (counter) => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const increment = target / countSpeed;

        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 10);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    };

    // Trigger stat counter animations using Intersection Observer
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const countersToAnimate = entry.target.querySelectorAll('.counter');
                countersToAnimate.forEach(c => startCounting(c));
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStatsSection = document.querySelector('.hero-stats');
    if (heroStatsSection) {
        statsObserver.observe(heroStatsSection);
    }

    // ==========================================================================
    // Interactive Solar Savings Calculator Engine
    // ==========================================================================
    const billSlider = document.getElementById('calc-bill-slider');
    const coverageSlider = document.getElementById('calc-coverage-slider');
    const billDisplay = document.getElementById('calc-bill-display');
    const coverageDisplay = document.getElementById('calc-coverage-display');
    
    const sectorResidential = document.getElementById('calc-sector-residential');
    const sectorCommercial = document.getElementById('calc-sector-commercial');
    
    const savingsAnnualEl = document.getElementById('savings-annual');
    const savingsPaybackEl = document.getElementById('savings-payback');
    const savingsLifetimeEl = document.getElementById('savings-lifetime');
    const envCo2El = document.getElementById('env-co2');
    const envTreesEl = document.getElementById('env-trees');

    let currentSector = 'residential'; // default

    const updateCalculator = () => {
        const billVal = parseInt(billSlider.value);
        const coverageVal = parseInt(coverageSlider.value);

        // Display updates
        billDisplay.textContent = `₦${billVal.toLocaleString('en-NG')}`;
        coverageDisplay.textContent = `${coverageVal}%`;

        // Mathematical Solar Estimations
        // Offset ratio (0.5 to 1.0)
        const offsetRatio = coverageVal / 100;
        
        // Base savings percentage: Solar replaces 90% of residential bills, 85% of commercial bills
        const efficiencyFactor = currentSector === 'residential' ? 0.90 : 0.85;
        
        // First-Year Annual Savings (in Naira)
        const annualSavings = Math.round(billVal * 12 * efficiencyFactor * offsetRatio);
        
        // System cost estimation: ~7 years worth of bill offsets
        const estimatedSystemCost = billVal * 12 * 7 * offsetRatio;
        
        // Payback Period (Years)
        // Bigger electricity bills amortize faster. Residential panels payback slightly faster
        const sectorBasePayback = currentSector === 'residential' ? 6.5 : 7.2;
        const discountFactor = (billVal / 60000); // scaled to ₦60,000 baseline
        const paybackPeriod = Math.max(4.2, (sectorBasePayback - discountFactor) / (offsetRatio * 0.95));

        // 25-Year Lifetime Savings (compounding typical 15% annual Nigerian electricity tariff inflation)
        let totalLifetimeSavings = 0;
        let yearlySavings = annualSavings;
        for (let i = 0; i < 25; i++) {
            totalLifetimeSavings += yearlySavings;
            yearlySavings *= 1.15; // Nigerian inflation rate on electricity tariffs
        }

        // Carbon Footprint calculations
        const annualCo2OffsetTons = parseFloat((billVal * 0.000016 * offsetRatio).toFixed(1));
        const equivalentTreesPlanted = Math.round(annualCo2OffsetTons * 16.5);

        // Render values to UI in Naira
        savingsAnnualEl.textContent = `₦${annualSavings.toLocaleString('en-NG')}`;
        savingsPaybackEl.innerHTML = `<span>${paybackPeriod.toFixed(1)}</span> Years`;
        savingsLifetimeEl.textContent = `₦${Math.round(totalLifetimeSavings).toLocaleString('en-NG')}`;
        envCo2El.textContent = `Offsets ${annualCo2OffsetTons} tons of CO2 / yr`;
        envTreesEl.textContent = `Equivalent to planting ${equivalentTreesPlanted} trees annually`;
    };

    if (billSlider && coverageSlider) {
        billSlider.addEventListener('input', updateCalculator);
        coverageSlider.addEventListener('input', updateCalculator);

        sectorResidential.addEventListener('click', () => {
            currentSector = 'residential';
            sectorResidential.classList.add('active');
            sectorCommercial.classList.remove('active');
            updateCalculator();
        });

        sectorCommercial.addEventListener('click', () => {
            currentSector = 'commercial';
            sectorCommercial.classList.add('active');
            sectorResidential.classList.remove('active');
            updateCalculator();
        });

        // Initialize calculator values on load
        updateCalculator();
    }

    // ==========================================================================
    // Multi-Step Consultation Quote Request Wizard
    // ==========================================================================
    const wizardForm = document.getElementById('solar-wizard-form');
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');
    const progressFill = document.getElementById('wizard-progress-fill');
    const stepTextIndicator = document.getElementById('wizard-step-text');
    const successScreen = document.getElementById('wizard-success-screen');
    const actionsBar = document.getElementById('wizard-actions-bar');
    const resetBtn = document.getElementById('wizard-reset-btn');

    let currentStep = 1;
    const totalSteps = wizardSteps.length;

    const updateWizardUI = () => {
        // Toggle Active Wizard Section Panel
        wizardSteps.forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Back button visibility
        if (currentStep === 1) {
            prevBtn.style.visibility = 'hidden';
        } else {
            prevBtn.style.visibility = 'visible';
        }

        // Action button title label
        if (currentStep === totalSteps) {
            nextBtn.textContent = 'Submit Proposal';
        } else {
            nextBtn.textContent = 'Next Step';
        }

        // Progress bar width & label updating
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressFill.style.width = `${progressPercentage}%`;

        // Update Text Steps
        const stepTitles = [
            'Project Scope',
            'Utility Spending',
            'Sunlight Exposure',
            'Contact Details'
        ];
        stepTextIndicator.textContent = `Step ${currentStep} of ${totalSteps}: ${stepTitles[currentStep - 1]}`;
    };

    const validateStep = (stepNumber) => {
        // Retrieve the current active step HTML block
        const activeStepBlock = document.querySelector(`.wizard-step[data-step="${stepNumber}"]`);
        if (!activeStepBlock) return true;

        // Perform HTML5 native validity checks on all input fields inside current step
        const fieldsToValidate = activeStepBlock.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        fieldsToValidate.forEach(field => {
            if (!field.checkValidity()) {
                field.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    };

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            // First validate inputs in current step before moving forward
            if (!validateStep(currentStep)) {
                return;
            }

            if (currentStep < totalSteps) {
                currentStep++;
                updateWizardUI();
            } else {
                // Submit Form - Success state trigger
                // Grab form data
                const formData = new FormData(wizardForm);
                console.log('Wizard Submitted Successfully:', Object.fromEntries(formData.entries()));

                // Transition panels to success state
                wizardForm.style.display = 'none';
                actionsBar.style.display = 'none';
                successScreen.style.display = 'block';
                stepTextIndicator.style.display = 'none';
                progressFill.parentElement.style.display = 'none';
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizardUI();
            }
        });

        // Wizard Reset handler
        resetBtn.addEventListener('click', () => {
            wizardForm.reset();
            currentStep = 1;
            
            // Restore layouts
            wizardForm.style.display = 'block';
            actionsBar.style.display = 'flex';
            successScreen.style.display = 'none';
            stepTextIndicator.style.display = 'block';
            progressFill.parentElement.style.display = 'block';

            updateWizardUI();
        });
    }

    // ==========================================================================
    // Accordion Interactive FAQs Interactivity
    // ==========================================================================
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            
            // Toggle active state for current item
            faqItem.classList.toggle('active');

            // Close other FAQ items for a clean accordion effect
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
        });
    });

    // ==========================================================================
    // Scroll Reveal Intersection Observer Animations
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.15, // trigger when 15% of the component is visible
        rootMargin: '0px 0px -50px 0px' // offset to feel more natural
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

});
