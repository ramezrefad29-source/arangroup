/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import { Clock, Scene, LoadingManager, WebGLRenderer, sRGBEncoding, Group, PerspectiveCamera, DirectionalLight, PointLight, MeshPhongMaterial } from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/////////////////////////////////////////////////////////////////////////
///// GLOBAL WINDOW & BUTTON EVENT DELEGATION
let currentLang = localStorage.getItem('aran_lang') || 'en'
let isSoundOn = false

window.toggleLanguage = function() {
    if (typeof playRoyalChime === 'function') playRoyalChime()
    const newLang = currentLang === 'en' ? 'ar' : 'en'
    if (typeof applyLanguage === 'function') applyLanguage(newLang)
}

window.toggleSound = function() {
    isSoundOn = !isSoundOn
    const soundIcon = document.getElementById('sound-icon')
    const soundLabel = document.getElementById('sound-label')
    if (soundIcon) soundIcon.className = isSoundOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'
    if (soundLabel) soundLabel.textContent = isSoundOn ? 'MUSIC ON' : 'MUSIC OFF'
    if (isSoundOn) {
        if (typeof startAmbientMusic === 'function') startAmbientMusic()
        if (typeof playRoyalChime === 'function') playRoyalChime()
    } else {
        if (typeof stopAmbientMusic === 'function') stopAmbientMusic()
    }
}

window.openAuthModal = function() {
    const m = document.getElementById('authenticity-modal')
    if (m) m.classList.add('active')
    if (typeof playRoyalChime === 'function') playRoyalChime()
}

window.closeAuthModal = function() {
    const m = document.getElementById('authenticity-modal')
    if (m) m.classList.remove('active')
}

window.openConciergeModal = function() {
    const m = document.getElementById('concierge-modal')
    const form = document.getElementById('concierge-form')
    const success = document.getElementById('concierge-success')
    if (form) form.style.display = 'block'
    if (success) success.classList.remove('active')
    if (m) m.classList.add('active')
    if (typeof playRoyalChime === 'function') playRoyalChime()
}

window.closeConciergeModal = function() {
    const m = document.getElementById('concierge-modal')
    if (m) m.classList.remove('active')
}

window.openSpecsModal = function() {
    const m = document.getElementById('specs-modal')
    if (m) m.classList.add('active')
    if (typeof playRoyalChime === 'function') playRoyalChime()
}

window.closeSpecsModal = function() {
    const m = document.getElementById('specs-modal')
    if (m) m.classList.remove('active')
}

window.openReviewModal = function() {
    const reviewModal = document.getElementById('review-modal')
    const form = document.getElementById('review-form')
    const success = document.getElementById('review-success')
    if (form) form.style.display = 'block'
    if (success) success.style.display = 'none'
    if (reviewModal) reviewModal.classList.add('active')
    if (typeof playRoyalChime === 'function') playRoyalChime()
}

window.closeReviewModal = function() {
    const reviewModal = document.getElementById('review-modal')
    if (reviewModal) reviewModal.classList.remove('active')
}

// Global Click Delegation (Guarantees click handling even on sub-elements)
document.addEventListener('click', (e) => {
    const btnLang = e.target.closest('#btn-lang-toggle')
    if (btnLang) { e.preventDefault(); window.toggleLanguage(); return }

    const btnSound = e.target.closest('#btn-sound-toggle')
    if (btnSound) { e.preventDefault(); window.toggleSound(); return }

    const btnVerify = e.target.closest('#btn-verify-nav')
    if (btnVerify) { e.preventDefault(); window.openAuthModal(); return }

    const btnConcierge = e.target.closest('#btn-concierge-nav')
    if (btnConcierge) { e.preventDefault(); window.openConciergeModal(); return }

    const btnReview = e.target.closest('#btn-open-review-modal')
    if (btnReview) { e.preventDefault(); window.openReviewModal(); return }

    const closeAuth = e.target.closest('#close-auth-modal')
    if (closeAuth) { e.preventDefault(); window.closeAuthModal(); return }

    const closeConcierge = e.target.closest('#close-concierge-modal')
    if (closeConcierge) { e.preventDefault(); window.closeConciergeModal(); return }

    const closeSpecs = e.target.closest('#close-specs-modal')
    if (closeSpecs) { e.preventDefault(); window.closeSpecsModal(); return }

    const closeReview = e.target.closest('#close-review-modal')
    if (closeReview) { e.preventDefault(); window.closeReviewModal(); return }
})

/////////////////////////////////////////////////////////////////////////
//// LOADING MANAGER & PRELOADER
const ftsLoader = document.querySelector(".lds-roller")
const looadingCover = document.getElementById("loading-text-intro")
const loadingManager = new LoadingManager()

loadingManager.onLoad = function() {
    const mainContainer = document.querySelector(".main-container")
    if (mainContainer) mainContainer.style.visibility = 'visible'
    document.querySelector("body").style.overflow = 'auto'

    const yPosition = { y: 0 }
    
    new TWEEN.Tween(yPosition).to({ y: 100 }, 1000).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onUpdate(function() { 
        if (looadingCover) looadingCover.style.setProperty('transform', `translate(0, ${yPosition.y}%)`)
    })
    .onComplete(function() {
        if (looadingCover && looadingCover.parentNode) {
            looadingCover.parentNode.removeChild(looadingCover)
        }
        TWEEN.remove(this)
    })

    introAnimation()
    window.scroll(0, 0)
}

// Safety preloader reveal fallback (guarantees main container is visible within 1 sec)
setTimeout(() => {
    const mainContainer = document.querySelector(".main-container")
    if (mainContainer) mainContainer.style.visibility = 'visible'
    document.body.style.overflow = 'auto'
    const looadingCover = document.getElementById("loading-text-intro")
    const ftsLoader = document.querySelector(".lds-roller")
    if (looadingCover && looadingCover.parentNode) looadingCover.parentNode.removeChild(looadingCover)
    if (ftsLoader && ftsLoader.parentNode) ftsLoader.parentNode.removeChild(ftsLoader)
}, 1000)

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER FOR 3D MODEL
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const loader = new GLTFLoader(loadingManager)
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINERS FOR THREEJS
const container = document.getElementById('canvas-container')
const containerDetails = document.getElementById('canvas-container-details')

/////////////////////////////////////////////////////////////////////////
///// GENERAL VARIABLES
let oldMaterial
let secondContainer = false
let width = container ? container.clientWidth : window.innerWidth
let height = container ? container.clientHeight : window.innerHeight

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new Scene()

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
renderer.autoClear = true
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer.setSize(width, height)
renderer.outputEncoding = sRGBEncoding
if (container) container.appendChild(renderer.domElement)

const renderer2 = new WebGLRenderer({ antialias: false, alpha: true })
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer2.setSize(width, height)
renderer2.outputEncoding = sRGBEncoding
if (containerDetails) containerDetails.appendChild(renderer2.domElement)

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const cameraGroup = new Group()
scene.add(cameraGroup)

const camera = new PerspectiveCamera(35, width / height, 1, 100)
camera.position.set(19, 1.54, -0.1)
cameraGroup.add(camera)

const camera2 = new PerspectiveCamera(35, (containerDetails ? containerDetails.clientWidth : width) / (containerDetails ? containerDetails.clientHeight : height), 1, 100)
camera2.position.set(1.9, 2.7, 2.7)
camera2.rotation.set(0, 1.1, 0)
scene.add(camera2)

/////////////////////////////////////////////////////////////////////////
///// RESPONSIVE RESIZE
window.addEventListener('resize', () => {
    if (container) {
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.clientWidth, container.clientHeight)
    }
    if (containerDetails) {
        camera2.aspect = containerDetails.clientWidth / containerDetails.clientHeight
        camera2.updateProjectionMatrix()
        renderer2.setSize(containerDetails.clientWidth, containerDetails.clientHeight)
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const sunLight = new DirectionalLight(0x435c72, 0.1)
sunLight.position.set(-100, 0, -100)
scene.add(sunLight)

const fillLight = new PointLight(0x88b2d9, 2.7, 4, 3)
fillLight.position.set(30, 3, 1.8)
scene.add(fillLight)

/////////////////////////////////////////////////////////////////////////
///// LOAD ORIGINAL 3D MODEL
loader.load('models/gltf/graces-draco2.glb', function (gltf) {
    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            oldMaterial = obj.material
            obj.material = new MeshPhongMaterial({
                shininess: 45
            })
        }
    })
    scene.add(gltf.scene)
    clearScene()
})

function clearScene() {
    if (oldMaterial) oldMaterial.dispose()
    renderer.renderLists.dispose()
}

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION
function introAnimation() {
    new TWEEN.Tween(camera.position.set(0, 4, 2.7)).to({ x: 0, y: 2.4, z: 8.8 }, 3500).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () {
        TWEEN.remove(this)
    })
}

/////////////////////////////////////////////////////////////////////////
//// PILLARS CLICK LISTENERS
const elAglaea = document.getElementById('aglaea')
const elThalia = document.getElementById('thalia')
const elEuphre = document.getElementById('euphre')
const elContent = document.getElementById('content')

if (elAglaea) {
    elAglaea.addEventListener('click', () => {
        elAglaea.classList.add('active')
        if (elThalia) elThalia.classList.remove('active')
        if (elEuphre) elEuphre.classList.remove('active')
        if (elContent) elContent.innerHTML = 'Bespoke Swiss-standard horology, master artisan leatherwork, and micro-precision assembly crafted to exact luxury specifications under Swiss and European manufacturing guidelines.'
        animateCamera({ x: 1.9, y: 2.7, z: 2.7 }, { y: 1.1 })
    })
}

if (elThalia) {
    elThalia.addEventListener('click', () => {
        elThalia.classList.add('active')
        if (elAglaea) elAglaea.classList.remove('active')
        if (elEuphre) elEuphre.classList.remove('active')
        if (elContent) elContent.innerHTML = 'Direct, authenticated, white-glove distribution channels operating with military-grade security and zero-latency clearance across China, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Jordan, and Palestine.'
        animateCamera({ x: -0.9, y: 3.1, z: 2.6 }, { y: -0.1 })
    })
}

if (elEuphre) {
    elEuphre.addEventListener('click', () => {
        elEuphre.classList.add('active')
        if (elAglaea) elAglaea.classList.remove('active')
        if (elThalia) elThalia.classList.remove('active')
        if (elContent) elContent.innerHTML = 'Strategic alliances with tier-one European luxury houses, securing exclusive allocation rights and VIP distribution for high-net-worth markets worldwide.'
        animateCamera({ x: -0.4, y: 2.7, z: 1.9 }, { y: -0.6 })
    })
}

function animateCamera(position, rotation) {
    new TWEEN.Tween(camera2.position).to(position, 1800).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () { TWEEN.remove(this) })

    new TWEEN.Tween(camera2.rotation).to(rotation, 1800).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () { TWEEN.remove(this) })
}

/////////////////////////////////////////////////////////////////////////
//// PARALLAX & CURSOR TRACKING
const cursor = { x: 0, y: 0 }
const clock = new Clock()
let previousTime = 0

const customCursor = document.querySelector('.cursor')

document.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / window.innerWidth - 0.5
    cursor.y = event.clientY / window.innerHeight - 0.5

    if (customCursor) {
        customCursor.style.left = `${event.clientX}px`
        customCursor.style.top = `${event.clientY}px`
    }
}, false)

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP
function rendeLoop() {
    TWEEN.update()

    if (secondContainer) {
        renderer2.render(scene, camera2)
    } else {
        renderer.render(scene, camera)
    }

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    const parallaxY = cursor.y
    fillLight.position.y -= (parallaxY * 9 + fillLight.position.y - 2) * deltaTime

    const parallaxX = cursor.x
    fillLight.position.x += (parallaxX * 8 - fillLight.position.x) * 2 * deltaTime

    cameraGroup.position.z -= (parallaxY / 3 + cameraGroup.position.z) * 2 * deltaTime
    cameraGroup.position.x += (parallaxX / 3 - cameraGroup.position.x) * 2 * deltaTime

    requestAnimationFrame(rendeLoop)
}
rendeLoop()

/////////////////////////////////////////////////////////////////////////
//// INTERSECTION OBSERVER FOR 3D PILLARS SECTION
const watchedSection = document.querySelector('.second')
if (watchedSection) {
    const ob = new IntersectionObserver((payload) => {
        secondContainer = payload[0].intersectionRatio > 0.05
    }, { threshold: 0.05 })
    ob.observe(watchedSection)
}

// Scroll Reveal Cards
const scrollCards = document.querySelectorAll('.scroll-reveal')
if (scrollCards.length > 0) {
    const cardOb = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible')
            }
        })
    }, { threshold: 0.15 })

    scrollCards.forEach(card => cardOb.observe(card))
}

/////////////////////////////////////////////////////////////////////////
//// SIDE VERTICAL TIMELINE - LIGHT UP WHITE DOTS ON SCROLL
const timelineDots = document.querySelectorAll('.timeline-dot')
const sections = document.querySelectorAll('#hero, #pillars, #brands, #network, #collections')

window.addEventListener('scroll', () => {
    let currentSection = 'hero'
    sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.clientHeight
        if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
            currentSection = section.getAttribute('id')
        }
    })

    timelineDots.forEach(dot => {
        if (dot.getAttribute('data-target') === currentSection) {
            dot.classList.add('active')
        } else {
            dot.classList.remove('active')
        }
    })
})

// Timeline dot click navigation
timelineDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const targetId = dot.getAttribute('data-target')
        const targetSection = document.getElementById(targetId)
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' })
        }
    })
})

/////////////////////////////////////////////////////////////////////////
//// BRAND FILTER TABS INTERACTIVITY
const filterTabs = document.querySelectorAll('.filter-tab')
const brandCards = document.querySelectorAll('.col-card')

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'))
        tab.classList.add('active')

        const filterValue = tab.getAttribute('data-filter')

        brandCards.forEach(card => {
            const category = card.getAttribute('data-category')
            if (filterValue === 'all' || category === filterValue) {
                card.classList.remove('hidden')
                setTimeout(() => card.classList.add('visible'), 50)
            } else {
                card.classList.remove('visible')
                card.classList.add('hidden')
            }
        })
    })
})

/////////////////////////////////////////////////////////////////////////
//// ANIMATED JET ROUTE
const animatedJet = document.getElementById('animated-jet')
const pathChinaDubai = document.getElementById('route-china-dubai')

let jetProgress = 0

function animateJetRoute() {
    jetProgress += 0.003
    if (jetProgress > 1) jetProgress = 0

    if (animatedJet && pathChinaDubai) {
        try {
            const totalLen = pathChinaDubai.getTotalLength()
            const point = pathChinaDubai.getPointAtLength(totalLen * jetProgress)
            const pointAhead = pathChinaDubai.getPointAtLength(Math.min(totalLen, totalLen * jetProgress + 5))
            
            const angle = Math.atan2(pointAhead.y - point.y, pointAhead.x - point.x) * (180 / Math.PI) + 90
            animatedJet.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle})`)
        } catch (e) {}
    }
    requestAnimationFrame(animateJetRoute)
}
animateJetRoute()

/////////////////////////////////////////////////////////////////////////
//// ROAD CAR SCROLL ANIMATION
const roadWrapper = document.querySelector('.road-scroll-wrapper')
const roadCar = document.getElementById('road-car')
const roadDots = document.querySelectorAll('.road-dot')

window.addEventListener('scroll', () => {
    if (!roadWrapper || !roadCar) return

    const wrapperRect = roadWrapper.getBoundingClientRect()
    const wrapperTop = roadWrapper.offsetTop
    const wrapperHeight = roadWrapper.offsetHeight
    const scrollY = window.scrollY
    const viewH = window.innerHeight

    // Calculate how far into the section we've scrolled (0 to 1)
    const progress = Math.max(0, Math.min(1, (scrollY - wrapperTop + viewH * 0.5) / wrapperHeight))

    // Light up road dots as car passes them
    roadDots.forEach(dot => {
        const dotIndex = parseInt(dot.getAttribute('data-index'))
        const dotThreshold = (dotIndex + 1) / (roadDots.length + 1)
        if (progress >= dotThreshold) {
            dot.classList.add('passed')
        } else {
            dot.classList.remove('passed')
        }
    })
})

/////////////////////////////////////////////////////////////////////////
//// ROYAL MODALS CONTROLLER & AUTHENTICITY SCANNER
const authModal = document.getElementById('authenticity-modal')
const conciergeModal = document.getElementById('concierge-modal')
const specsModal = document.getElementById('specs-modal')

const btnVerifyNav = document.getElementById('btn-verify-nav')
const btnConciergeNav = document.getElementById('btn-concierge-nav')

const closeAuthBtn = document.getElementById('close-auth-modal')
const closeConciergeBtn = document.getElementById('close-concierge-modal')
const closeSpecsBtn = document.getElementById('close-specs-modal')

// Open Auth Scanner Modal
if (btnVerifyNav && authModal) {
    btnVerifyNav.addEventListener('click', () => authModal.classList.add('active'))
}

// Open Concierge Modal
if (btnConciergeNav && conciergeModal) {
    btnConciergeNav.addEventListener('click', () => {
        const conciergeForm = document.getElementById('concierge-form')
        const conciergeSuccess = document.getElementById('concierge-success')
        if (conciergeForm) conciergeForm.style.display = 'block'
        if (conciergeSuccess) conciergeSuccess.classList.remove('active')
        conciergeModal.classList.add('active')
    })
}

// Close Modals
if (closeAuthBtn) closeAuthBtn.addEventListener('click', () => authModal.classList.remove('active'))
if (closeConciergeBtn) closeConciergeBtn.addEventListener('click', () => conciergeModal.classList.remove('active'))
if (closeSpecsBtn) closeSpecsBtn.addEventListener('click', () => specsModal.classList.remove('active'))

[authModal, conciergeModal, specsModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active')
        })
    }
})

// Serial Code Database & Verification
const serialDb = {
    'AG-8890-CH': { brand: 'ROLEX GENEVA', code: 'AG-8890-CH', origin: 'Geneva, Switzerland', item: 'Rolex Cosmograph Daytona 18K' },
    'AG-7721-FR': { brand: 'HERMÈS PARIS', code: 'AG-7721-FR', origin: 'Paris, France', item: 'Hermès Birkin Crocodile & Silver Serpent' },
    'AG-9904-CH': { brand: 'PATEK PHILIPPE GENEVE', code: 'AG-9904-CH', origin: 'Geneva, Switzerland', item: 'Patek Philippe Grand Complications' },
    'AG-5510-FR': { brand: 'LOUIS VUITTON PARIS', code: 'AG-5510-FR', origin: 'Asnières-sur-Seine, France', item: 'Louis Vuitton Monogram Trunk' }
}

const btnScanNow = document.getElementById('btn-scan-now')
const serialInput = document.getElementById('serial-input')
const certOutput = document.getElementById('cert-output')
const certBrand = document.getElementById('cert-brand')
const certCode = document.getElementById('cert-code')
const certOrigin = document.getElementById('cert-origin')

function runScanProcess(codeVal) {
    const code = (codeVal || (serialInput ? serialInput.value : '')).trim().toUpperCase()
    if (!code) return

    const data = serialDb[code] || {
        brand: 'HAUTE MANUFACTURE ALLIANCE',
        code: code,
        origin: 'European Certified Vault',
        item: 'Bespoke Luxury Allocation'
    }

    if (certBrand) certBrand.textContent = data.brand
    if (certCode) certCode.textContent = data.code
    if (certOrigin) certOrigin.textContent = data.origin
    if (certOutput) certOutput.classList.add('active')
}

if (btnScanNow) {
    btnScanNow.addEventListener('click', () => runScanProcess())
}

document.querySelectorAll('.code-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        const code = pill.getAttribute('data-code')
        if (serialInput) serialInput.value = code
        runScanProcess(code)
    })
})

// Concierge Request Form Submission
window.submitConciergeRequest = function() {
    const conciergeForm = document.getElementById('concierge-form')
    const conciergeSuccess = document.getElementById('concierge-success')
    const tktId = document.getElementById('tkt-id')
    
    if (tktId) {
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        tktId.textContent = `#AG-${randomNum}-VIP`
    }
    
    if (conciergeForm) conciergeForm.style.display = 'none'
    if (conciergeSuccess) conciergeSuccess.classList.add('active')
}

// Brand Cards Spec Drawer Modal Trigger
const specData = [
    { title: 'PATEK PHILIPPE IMPERIAL FALCON', desc: 'An imperial golden falcon with outstretched wings guarding an 18K gold skeleton tourbillon. Museum-grade Swiss horology meets royal majesty.', calibre: 'CH 29-535 PS Q Automatic', comp: 'Tourbillon, Perpetual Calendar', reserve: '72 Hours', auth: 'Geneva Seal & Aran Guarantee', img: 'images/falcon_watch.jpg' },
    { title: 'HERMÈS KELLY EMERALD PANTHER', desc: 'A sleek melanistic black panther resting beside a rare emerald-green crocodile leather Hermès Kelly bag with 24K gold hardware.', calibre: 'Hand-stitched Crocodile Leather', comp: '24K Gold Clasp, Emerald Finish', reserve: 'Lifetime Vault Warranty', auth: 'Hermès Paris Verified', img: 'images/panther_bag.jpg' },
    { title: 'ROLEX DAYTONA SOVEREIGN CROWN', desc: 'A solid 18K gold sovereign crown encrusted with diamonds encircling a pristine Rolex Cosmograph Daytona watch. Royalty in motorsport horology.', calibre: 'Rolex Calibre 4130', comp: 'Chronometer, Diamond Crown', reserve: '72 Hours', auth: 'COSC Certified & Aran Guarantee', img: 'images/crown_rolex.jpg' },
    { title: 'LOUIS VUITTON CARBON HYPERCAR', desc: 'A futuristic matte-black carbon hypercar parked beside a classic custom Louis Vuitton monogram leather courrier trunk inside a golden neon showroom.', calibre: 'Monogram Full-Grain Calfskin', comp: 'Carbon Fiber Frame & Brass Clasp', reserve: 'Sovereign Edition', auth: 'Louis Vuitton Paris Verified', img: 'images/hypercar_trunk.jpg' }
]

const brandCardsList = document.querySelectorAll('.col-card')
brandCardsList.forEach((card, idx) => {
    card.addEventListener('click', () => {
        const itemData = specData[idx % specData.length]
        const specTitle = document.getElementById('spec-title')
        const specDesc = document.getElementById('spec-desc')
        const specImg = document.getElementById('spec-img')
        const spCalibre = document.getElementById('sp-calibre')
        const spComp = document.getElementById('sp-comp')
        const spReserve = document.getElementById('sp-reserve')
        const spAuth = document.getElementById('sp-auth')

        if (specTitle) specTitle.textContent = itemData.title
        if (specDesc) specDesc.textContent = itemData.desc
        if (specImg) specImg.src = itemData.img
        if (spCalibre) spCalibre.textContent = itemData.calibre
        if (spComp) spComp.textContent = itemData.comp
        if (spReserve) spReserve.textContent = itemData.reserve
        if (spAuth) spAuth.textContent = itemData.auth

        if (specsModal) specsModal.classList.add('active')
    })
})

const btnSpecOrder = document.getElementById('btn-spec-order')
if (btnSpecOrder && specsModal && conciergeModal) {
    btnSpecOrder.addEventListener('click', () => {
        specsModal.classList.remove('active')
        const conciergeForm = document.getElementById('concierge-form')
        const conciergeSuccess = document.getElementById('concierge-success')
        if (conciergeForm) conciergeForm.style.display = 'block'
        if (conciergeSuccess) conciergeSuccess.classList.remove('active')
        conciergeModal.classList.add('active')
    })
}

// Hub Switcher Currency Persistence
const hubSelector = document.getElementById('hub-selector')
if (hubSelector) {
    hubSelector.addEventListener('change', (e) => {
        const hub = e.target.value
        localStorage.setItem('aran_hub', hub)
    })
    const savedHub = localStorage.getItem('aran_hub')
    if (savedHub) hubSelector.value = savedHub
}

/////////////////////////////////////////////////////////////////////////
//// ARABIC / ENGLISH FULL SITE TRANSLATOR & SOUND EFFECTS
// (currentLang and isSoundOn declared at top of file)

// playRoyalChime and audioCtx are defined later in the file (lazy-init pattern)

// Translations Dictionary
// Complete Unified Site Translation Dictionary
const translations = {
    ar: {
        langBtn: 'ENGLISH',
        heroSub: 'دار التصنيع والتوريد الملكي الفاخر',
        heroTitle: 'آران جروب',
        heroText: 'ريادة التجارة العالمية، والتصنيع الفاخر بالمعايير السويسرية، والتوريد المباشر لأرقى الساعات العالمية، والمنتجات الجلدية العريقة لجميع دول الخليج والأردن وفلسطين والعواصم العالمية.',
        navHeritage: 'التراث والريادة',
        navPillars: 'الركائز الثلاث',
        navBrands: 'الدور العالمية',
        navLogistics: 'الملاحة الجوية',
        navCollections: 'المجموعات الفاخرة',
        btnVerifyNav: 'التحقق من الأصالة',
        btnConciergeNav: 'الحجز الملكي الفوري',
        pillarsSub: 'الركائز الثلاث الرئيسية',
        p1: 'التصنيع والساعات',
        p2: 'سلسلة الشحن',
        p3: 'التحالفات العالمية',
        colSub: 'الدور العالمية المعتمدة',
        colTitle: 'تحالفات البراندات العالمية والمجموعات الفاخرة',
        colDesc: 'مصنعة وموردة مباشرة وفق أعلى معايير الجودة والأصالة الأوروبية.',
        tabAll: 'جميع الدور العالمية',
        netTitle: 'شبكة الملاحة والشحن الجوي الملكي',
        netDesc: 'نقل جوي مؤمن ومباشر يربط مراكز التصنيع في آسيا وسويسرا بمراكز التوزيع في الإمارات، السعودية، قطر، الكويت، البحرين، عمان، الأردن، وفلسطين.',
        footer: 'آران جروب القابضة © 2026. التصنيع الملكي والتوريد العالمي المباشر.',
        wsBadge: 'معايير عالمية رفيعة',
        wsTitle: 'لماذا يختار العالم آران جروب؟',
        wsDesc: 'من مختبرات سويسرا إلى قصور الخليج — كل قطعة نسلّمها هي وعد بالأصل والدقة والرقي الملكي.',
        feat1Title: 'أصالة معتمدة 100٪',
        feat1Desc: 'كل ساعة أو حقيبة جلدية تحمل شهادة تسلسل فريدة من آران جروب، موثّقة وفق سجلات المصانع السويسرية والفرنسية.',
        feat2Title: 'توصيل جوي مدرّع خاص',
        feat2Desc: 'لوجستيات جوية بالقفاز الأبيض من جنيف وباريس مباشرة إلى وجهتك المفضّلة في الخليج أو المشرق، بدون وسطاء.',
        feat3Title: 'تحالفات مباشرة مع البراندات',
        feat3Desc: 'شراكات توزيع حصرية مع رولكس وباتيك فيليب وهيرمس ولويس فيتون — بعيداً عن السوق الرمادية كلياً.',
        feat4Title: 'شبكة توزيع عالمية',
        feat4Desc: 'تواجد في 14 دولة تمتد عبر أوروبا ودول مجلس التعاون الخليجي والمشرق والأسواق الآسيوية الناشئة.',
        feat5Title: 'إرث منذ 2004',
        feat5Desc: 'أكثر من عقدين من التميّز التجاري المتواصل، وبناء علاقات راسخة مع أرقى دور الأزياء العالمية.',
        feat6Title: 'تخصيص حسب الطلب',
        feat6Desc: 'نقش خاص، ترمّز سري، طلبات مواصفات خاصة للأرقام، وتكليفات جلدية مخصصة حسب رغبة العميل.',
        stat1Lbl: 'قطعة مُسلَّمة',
        stat2Lbl: 'دولة نخدمها',
        stat3Lbl: 'سنة من الإرث',
        stat4Lbl: 'رضا العملاء',
        gal1Txt: 'إصدار الصقر الإمبراطوري',
        gal2Txt: 'حارس النمر الزمرّدي',
        gal3Txt: 'إصدار التاج السيادي',
        gal4Txt: 'صندوق الهايبركار الكربوني',
        revBadge: 'المقاييس العالمية والشهادات',
        revTitle: 'آران جروب بالأرقام',
        revDesc: 'مؤشرات أداء موثقة عبر 14 دولة، موثوق من قِبل الملوك والهواة والكيانات السيادية.',
        btnWriteLbl: 'شاركنا تجربتك',
        revModalTitle: 'شاركنا تجربتك',
        revModalDesc: 'تظهر مراجعتك مباشرة على الموقع فور إرسالها. لا يلزم تسجيل.',
        revNameLbl: 'اسمك / لقبك',
        revCountryLbl: 'البلد / المدينة',
        revProductLbl: 'القطعة / الخدمة',
        revStarsLbl: 'تقييمك',
        revTextLbl: 'شهادتك',
        revSubmitLbl: 'نشر مراجعتي',
        revSuccessTitle: 'مراجعتك منشورة الآن!',
        revSuccessDesc: 'شكراً لمشاركة تجربتك مع آران جروب. تم نشر شهادتك على موقعنا.',
        ftCtaTitle: 'احصل على قطعتك الملكية الفاخرة اليوم',
        ftCtaDesc: 'توصيل جوي مدرّع ومؤمن بالكامل عبر أسطول طائرات آران الجوية لجميع دول الخليج والأردن وفلسطين والعواصم العالمية.',
        ftBtnConcierge: 'الحجز الملكي الفوري',
        ftBtnVerify: 'التحقق من الأصالة',
        ftAboutTxt: 'ريادة التجارة العالمية، والتصنيع الفاخر بالمعايير السويسرية، والتوريد المباشر لأرقى الساعات العالمية، والمنتجات الجلدية العريقة لجميع دول الخليج والأردن وفلسطين والعواصم العالمية.',
        ftNavTitle: 'التنقل التنفيذي',
        ftLink1: 'التراث والريادة',
        ftLink2: 'لماذا تختار آران جروب',
        ftLink3: 'الدور العالمية المعتمدة',
        ftLink4: 'شهادات وآراء العملاء',
        ftLink5: 'فاحص أصالة القطع السويسري',
        ftLink6: 'خدمة الشحن الجوي الملكي',
        ftHubsTitle: 'المراكز والمستودعات الإقليمية',
        ftContactTitle: 'مكتب الاستعلامات الملكي المباشر',
        ftCopyTxt: 'آران جروب القابضة © 2026. التصنيع الملكي والتوريد العالمي المباشر.',
        revSubTitle: 'شهادات وآراء العملاء الموثقة',
        stC1Title: 'القطع الفاخرة المعتمدة المُسلمة',
        stC1Desc: 'ساعات نادرة ومنتجات جلدية مصممة خصيصاً ومسجلة في الخزائن الملكية.',
        stC2Title: 'الدول السيادية المخدومة',
        stC2Desc: 'خطوط توريد دبلوماسية وVIP مباشرة تشمل الإمارات والسعودية وقطر والأردن وفلسطين وسويسرا.',
        stC3Title: 'أصالة الخزينة السويسرية',
        stC3Desc: 'أصالة ومصدر موثق 100% ومسجل مباشرة في أرشيف المصانع السويسرية والفرنسية.',
        stC4Title: 'سنوات التراث والريادة',
        stC4Desc: 'أكثر من عقدين من التميز الساعاتي والتجاري وتأسيس الثقة السيادية منذ 2004.',
        stC5Title: 'معدل رضا الملوك والعملاء',
        stC5Desc: 'تقييم استثنائي من كبار الشخصيات وجامعي التحف والمقتنيات الثمينة حول العالم.',
        stC6Title: 'رحلات الطيران الجوي المدرّع',
        stC6Desc: 'نقل جوي مشفّر فائق الأمان بأسطول طائرات خاص وبدون أي تأخير جمركي.'
    },
    en: {
        langBtn: 'العربية',
        heroSub: 'MAISON DE MANUFACTURE & LUXURY SUPPLY',
        heroTitle: 'ARAN GROUP',
        heroText: 'Pioneering global trade, bespoke Swiss-standard manufacturing, and direct distribution of elite horology, fine leathercraft, and world-class luxury houses across the Middle East, Asia, and global financial capitals.',
        navHeritage: 'HERITAGE',
        navPillars: 'PILLARS',
        navBrands: 'BRANDS',
        navLogistics: 'LOGISTICS',
        navCollections: 'COLLECTIONS',
        btnVerifyNav: 'VERIFY PIECE',
        btnConciergeNav: 'VIP CONCIERGE',
        pillarsSub: 'THREE FOUNDATIONAL PILLARS',
        p1: 'MANUFACTURING',
        p2: 'SUPPLY CHAIN',
        p3: 'ALLIANCES',
        colSub: 'CURATED HAUTE HOUSES',
        colTitle: 'AUTHORIZED BRAND ALLIANCES & COLLECTIONS',
        colDesc: 'Directly manufactured, sourced, and distributed under strict European authenticity standards.',
        tabAll: 'ALL HOUSES',
        netTitle: 'INTER-CONTINENTAL AIRWAY NETWORK',
        netDesc: 'Direct encrypted jet transports connecting Asia manufacturing hubs with premier distribution centers across UAE, KSA, Qatar, Kuwait, Bahrain, Oman, Jordan, and Palestine.',
        footer: 'ARAN GROUP HOLDINGS © 2026. HAUTE MANUFACTURE & GLOBAL SUPPLY.',
        wsBadge: 'WORLD-CLASS STANDARDS',
        wsTitle: 'Why the World Chooses ARAN GROUP',
        wsDesc: 'From Swiss laboratories to Gulf palaces — every piece we deliver is a promise of origin, precision, and sovereign luxury.',
        feat1Title: '100% Certified Authenticity',
        feat1Desc: 'Every timepiece and leathercraft carries a unique Aran Group serial certificate, validated against Swiss and French manufacture records.',
        feat2Title: 'Private Armored Airway Delivery',
        feat2Desc: 'White-glove armored air logistics from Geneva and Paris directly to your preferred Gulf or Levant capital, with zero intermediaries.',
        feat3Title: 'Direct Brand Alliances',
        feat3Desc: 'Exclusive allocation partnerships with Rolex, Patek Philippe, Hermès, and Louis Vuitton — bypassing grey market entirely.',
        feat4Title: 'Global Distribution Network',
        feat4Desc: 'Presence across 14 countries spanning Europe, Gulf Cooperation Council states, Levant, and emerging Asian luxury markets.',
        feat5Title: 'Heritage Since 2004',
        feat5Desc: "Over two decades of uninterrupted trade excellence, building legacy relationships with the world's most exclusive maisons.",
        feat6Title: 'Bespoke Customization',
        feat6Desc: 'Custom engraving, private monogramming, special-order dial configurations, and bespoke leather commissions upon client request.',
        stat1Lbl: 'Pieces Delivered',
        stat2Lbl: 'Countries Served',
        stat3Lbl: 'Years of Heritage',
        stat4Lbl: 'Client Satisfaction',
        gal1Txt: 'Imperial Falcon Edition',
        gal2Txt: 'Emerald Panther Sentinel',
        gal3Txt: 'Sovereign Crown Edition',
        gal4Txt: 'Carbon Hypercar Trunk',
        revBadge: 'GLOBAL METRICS & TESTIMONIALS',
        revTitle: 'ARAN GROUP IN NUMBERS',
        revDesc: 'Verified performance indicators across 14 nations, trusted by royalty, private collectors, and sovereign entities worldwide.',
        btnWriteLbl: 'Share Your Experience',
        revModalTitle: 'Share Your Experience',
        revModalDesc: 'Your review appears live on our website instantly. No registration required.',
        revNameLbl: 'YOUR NAME / TITLE',
        revCountryLbl: 'COUNTRY / CITY',
        revProductLbl: 'PIECE / SERVICE REVIEWED',
        revStarsLbl: 'YOUR RATING',
        revTextLbl: 'YOUR TESTIMONIAL',
        revSubmitLbl: 'PUBLISH MY REVIEW',
        revSuccessTitle: 'Your review is now live!',
        revSuccessDesc: 'Thank you for sharing your experience with Aran Group. Your testimonial has been published on our website.',
        ftCtaTitle: 'ACQUIRE YOUR HAUTE ALLOCATION TODAY',
        ftCtaDesc: 'Direct priority delivery via Aran Airway Armored Logistics across Gulf, Levant & Global Financial Capitals.',
        ftBtnConcierge: 'VIP CONCIERGE ALLOCATION',
        ftBtnVerify: 'VERIFY SERIAL',
        ftAboutTxt: 'Pioneering global trade, bespoke Swiss-standard manufacturing, and direct distribution of elite horology, fine leathercraft, and world-class luxury houses across UAE, KSA, Qatar, Kuwait, Bahrain, Oman, Jordan, Palestine, and global financial capitals.',
        ftNavTitle: 'EXECUTIVE NAVIGATION',
        ftLink1: 'Heritage & Leadership',
        ftLink2: 'Why Choose Aran Group',
        ftLink3: 'Authorized Brand Alliances',
        ftLink4: 'Client Testimonials',
        ftLink5: 'Authenticity Vault Scanner',
        ftLink6: 'VIP Airway Concierge',
        ftHubsTitle: 'REGIONAL HUBS & VAULTS',
        ftContactTitle: 'DIRECT CONCIERGE DESK',
        ftCopyTxt: 'ARAN GROUP HOLDINGS © 2026. HAUTE MANUFACTURE & DIRECT GLOBAL SUPPLY.',
        revSubTitle: 'Verified Client Testimonials',
        stC1Title: 'HAUTE ALLOCATIONS DELIVERED',
        stC1Desc: 'Certified timepieces & bespoke leathercraft delivered to royal vaults & private clients.',
        stC2Title: 'SOVEREIGN NATIONS SERVED',
        stC2Desc: 'Direct diplomatic & VIP supply routes across UAE, KSA, Qatar, Jordan, Palestine, & Switzerland.',
        stC3Title: 'SWISS VAULT AUTHENTICITY',
        stC3Desc: '100% verified serial origin registered directly with Swiss & French manufacture archives.',
        stC4Title: 'YEARS OF HERITAGE',
        stC4Desc: 'Uninterrupted trade & horological excellence establishing sovereign trust since 2004.',
        stC5Title: 'CLIENT SATISFACTION SCORE',
        stC5Desc: 'Exceptional VIP feedback from ultra-high-net-worth individuals and private collectors.',
        stC6Title: 'ARMORED AIRLOGISTICS FLIGHTS',
        stC6Desc: 'Priority encrypted jet transfers with zero-latency clearance & white-glove security.'
    }
}

function applyLanguage(lang) {
    currentLang = lang
    localStorage.setItem('aran_lang', lang)
    const t = translations[lang]
    if (!t) return

    if (lang === 'ar') {
        document.body.classList.add('rtl-mode')
    } else {
        document.body.classList.remove('rtl-mode')
    }

    const langLabel = document.getElementById('lang-label')
    if (langLabel) langLabel.textContent = t.langBtn

    // Update Hero
    const heroSub = document.querySelector('.first > h2')
    const heroTitle = document.querySelector('.first > h1')
    const heroText = document.querySelector('.hero-text')
    if (heroSub) heroSub.textContent = t.heroSub
    if (heroTitle) heroTitle.textContent = t.heroTitle
    if (heroText) heroText.textContent = t.heroText

    // Update Nav
    const navLinks = document.querySelectorAll('nav.header a span')
    if (navLinks.length >= 5) {
        navLinks[0].textContent = t.navHeritage
        navLinks[1].textContent = t.navPillars
        navLinks[2].textContent = t.navBrands
        navLinks[3].textContent = t.navLogistics
        navLinks[4].textContent = t.navCollections
    }

    // Update Action Buttons
    const btnVerifyNavText = document.querySelector('#btn-verify-nav')
    const btnConciergeNavText = document.querySelector('#btn-concierge-nav')
    if (btnVerifyNavText) btnVerifyNavText.innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${t.btnVerifyNav}`
    if (btnConciergeNavText) btnConciergeNavText.innerHTML = `<i class="fa-solid fa-plane-lock"></i> ${t.btnConciergeNav}`

    // Update Pillars
    const pilSub = document.querySelector('.second-container .sub-badge')
    const pAglaea = document.getElementById('aglaea')
    const pThalia = document.getElementById('thalia')
    const pEuphre = document.getElementById('euphre')
    if (pilSub) pilSub.textContent = t.pillarsSub
    if (pAglaea) pAglaea.textContent = t.p1
    if (pThalia) pThalia.textContent = t.p2
    if (pEuphre) pEuphre.textContent = t.p3

    // Update Collections
    const colSub = document.querySelector('.collections-section .sub-badge')
    const colTitle = document.querySelector('.col-header h2')
    const colDesc = document.querySelector('.col-header p')
    const tabAll = document.querySelector('.filter-tab[data-filter="all"]')
    if (colSub) colSub.textContent = t.colSub
    if (colTitle) colTitle.textContent = t.colTitle
    if (colDesc) colDesc.textContent = t.colDesc
    if (tabAll) tabAll.textContent = t.tabAll

    // Update Logistics
    const netTitle = document.querySelector('.net-header h2')
    const netDesc = document.querySelector('.net-header p')
    if (netTitle) netTitle.textContent = t.netTitle
    if (netDesc) netDesc.textContent = t.netDesc

    // Update Footer
    const footer = document.querySelector('.footer')
    if (footer) footer.textContent = t.footer

    // Update White Section, Reviews & Grand Footer by ID
    const ids = [
        ['ws-badge', 'wsBadge'], ['ws-title', 'wsTitle'], ['ws-desc', 'wsDesc'],
        ['feat1-title', 'feat1Title'], ['feat1-desc', 'feat1Desc'],
        ['feat2-title', 'feat2Title'], ['feat2-desc', 'feat2Desc'],
        ['feat3-title', 'feat3Title'], ['feat3-desc', 'feat3Desc'],
        ['feat4-title', 'feat4Title'], ['feat4-desc', 'feat4Desc'],
        ['feat5-title', 'feat5Title'], ['feat5-desc', 'feat5Desc'],
        ['feat6-title', 'feat6Title'], ['feat6-desc', 'feat6Desc'],
        ['stat1-lbl', 'stat1Lbl'], ['stat2-lbl', 'stat2Lbl'],
        ['stat3-lbl', 'stat3Lbl'], ['stat4-lbl', 'stat4Lbl'],
        ['gal1-txt', 'gal1Txt'], ['gal2-txt', 'gal2Txt'],
        ['gal3-txt', 'gal3Txt'], ['gal4-txt', 'gal4Txt'],
        ['rev-badge', 'revBadge'], ['rev-title', 'revTitle'], ['rev-desc', 'revDesc'],
        ['btn-write-lbl', 'btnWriteLbl'],
        ['rev-modal-title', 'revModalTitle'], ['rev-modal-desc', 'revModalDesc'],
        ['rev-name-lbl', 'revNameLbl'], ['rev-country-lbl', 'revCountryLbl'],
        ['rev-product-lbl', 'revProductLbl'], ['rev-stars-lbl', 'revStarsLbl'],
        ['rev-text-lbl', 'revTextLbl'], ['rev-submit-lbl', 'revSubmitLbl'],
        ['rev-success-title', 'revSuccessTitle'], ['rev-success-desc', 'revSuccessDesc'],
        ['ft-cta-title', 'ftCtaTitle'], ['ft-cta-desc', 'ftCtaDesc'],
        ['ft-btn-concierge', 'ftBtnConcierge'], ['ft-btn-verify', 'ftBtnVerify'],
        ['ft-about-txt', 'ftAboutTxt'], ['ft-nav-title', 'ftNavTitle'],
        ['ft-link1', 'ftLink1'], ['ft-link2', 'ftLink2'], ['ft-link3', 'ftLink3'],
        ['ft-link4', 'ftLink4'], ['ft-link5', 'ftLink5'], ['ft-link6', 'ftLink6'],
        ['ft-hubs-title', 'ftHubsTitle'], ['ft-contact-title', 'ftContactTitle'],
        ['ft-copy-txt', 'ftCopyTxt'], ['rev-sub-title', 'revSubTitle'],
        ['st-c1-title', 'stC1Title'], ['st-c1-desc', 'stC1Desc'],
        ['st-c2-title', 'stC2Title'], ['st-c2-desc', 'stC2Desc'],
        ['st-c3-title', 'stC3Title'], ['st-c3-desc', 'stC3Desc'],
        ['st-c4-title', 'stC4Title'], ['st-c4-desc', 'stC4Desc'],
        ['st-c5-title', 'stC5Title'], ['st-c5-desc', 'stC5Desc'],
        ['st-c6-title', 'stC6Title'], ['st-c6-desc', 'stC6Desc']
    ]
    ids.forEach(([id, key]) => {
        const el = document.getElementById(id)
        if (el && t[key]) el.textContent = t[key]
    })
}

// Language button handler and initial apply are at the bottom of the file (unified handler)

// ================================================================
//  AMBIENT MUSIC — Real Audio Element with CDN-hosted loopable track
// ================================================================
let ambientAudio = null
let isMusicPlaying = false

function initAmbientAudio() {
    if (ambientAudio) return
    ambientAudio = new Audio()
    // Local ambient luxury track stored in static/audio/ambient.mp3
    ambientAudio.src = 'audio/ambient.mp3'
    ambientAudio.loop = true
    ambientAudio.volume = 0
    ambientAudio.preload = 'auto'
}

function fadeVolume(audio, from, to, durationMs) {
    const steps = 40
    const interval = durationMs / steps
    const delta = (to - from) / steps
    let current = from
    audio.volume = Math.max(0, Math.min(1, from))
    const timer = setInterval(() => {
        current += delta
        audio.volume = Math.max(0, Math.min(1, current))
        if ((delta > 0 && current >= to) || (delta < 0 && current <= to)) {
            audio.volume = Math.max(0, Math.min(1, to))
            clearInterval(timer)
            if (to === 0) audio.pause()
        }
    }, interval)
}

async function startAmbientMusic() {
    initAmbientAudio()
    try {
        ambientAudio.currentTime = 0
        await ambientAudio.play()
        fadeVolume(ambientAudio, 0, 0.28, 2500)
        isMusicPlaying = true
    } catch (e) {
        // Autoplay blocked — will retry on next click
        isSoundOn = false
        const si = document.getElementById('sound-icon')
        const sl = document.getElementById('sound-label')
        if (si) si.className = 'fa-solid fa-volume-xmark'
        if (sl) sl.textContent = 'MUSIC OFF'
    }
}

function stopAmbientMusic() {
    if (!ambientAudio) return
    fadeVolume(ambientAudio, ambientAudio.volume, 0, 800)
    isMusicPlaying = false
}

// Web Audio API chime for luxury button feedback
let audioCtx = null

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    return audioCtx
}

function playRoyalChime() {
    if (!isSoundOn) return
    try {
        const ctx = getAudioCtx()
        if (ctx.state === 'suspended') ctx.resume()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.06, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.28)
    } catch (e) {}
}

// Sound Toggle Button
const btnSoundToggle = document.getElementById('btn-sound-toggle')
const soundIcon = document.getElementById('sound-icon')
const soundLabel = document.getElementById('sound-label')

if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
        isSoundOn = !isSoundOn
        if (soundIcon) soundIcon.className = isSoundOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'
        if (soundLabel) soundLabel.textContent = isSoundOn ? 'MUSIC ON' : 'MUSIC OFF'
        if (isSoundOn) {
            startAmbientMusic()
            playRoyalChime()
        } else {
            stopAmbientMusic()
        }
    })
}

// Play chime on interactive elements
document.querySelectorAll('button, .filter-tab, .timeline-dot').forEach(el => {
    el.addEventListener('click', () => playRoyalChime())
})

// ================================================================
//  LIVE REVIEWS SYSTEM (localStorage — appears on-site instantly)
// ================================================================

const DEFAULT_REVIEWS = [
    {
        name: 'H.H. Sultan Al-Mansouri',
        country: 'Abu Dhabi, UAE',
        product: 'Rolex Cosmograph Daytona 18K',
        stars: 5,
        text: 'A transcendent acquisition experience. The Daytona arrived in a hand-stitched leather vault with complete provenance documentation. Aran Group has redefined what luxury delivery means.',
        date: '2026-07-18'
    },
    {
        name: 'Mme. Isabelle Renard',
        country: 'Geneva, Switzerland',
        product: 'Hermès Birkin Crocodile',
        stars: 5,
        text: 'I have purchased Birkins from three continents. None matched the discretion, documentation, and personal attention that Aran Group provided. A true maison of trust.',
        date: '2026-06-30'
    },
    {
        name: 'Sheikh Faisal Al-Rashidi',
        country: 'Riyadh, KSA',
        product: 'Patek Philippe Grand Complications',
        stars: 5,
        text: 'The Patek Tourbillon exceeded every expectation. The private jet delivery with an Aran Group representative in attendance was an extraordinary gesture of white-glove service.',
        date: '2026-05-12'
    }
]

function loadReviews() {
    const stored = localStorage.getItem('aran_reviews')
    return stored ? JSON.parse(stored) : DEFAULT_REVIEWS
}

function saveReviews(reviews) {
    localStorage.setItem('aran_reviews', JSON.stringify(reviews))
}

function starsHTML(n) {
    let s = ''
    for (let i = 0; i < 5; i++) s += i < n ? '★' : '☆'
    return s
}

function renderReviews() {
    const grid = document.getElementById('reviews-grid')
    if (!grid) return
    const reviews = loadReviews()
    if (reviews.length === 0) {
        grid.innerHTML = '<div class="no-reviews-msg">Be the first to share your experience.</div>'
        return
    }
    grid.innerHTML = reviews.map(r => `
        <div class="review-card">
            <div class="review-stars">${starsHTML(r.stars)}</div>
            <p class="review-text">"${r.text}"</p>
            <div class="review-author">
                <div class="review-avatar">${r.name.charAt(0)}</div>
                <div>
                    <div class="review-name">${r.name}</div>
                    <div class="review-meta">${r.product} · ${r.country} · ${r.date}</div>
                </div>
            </div>
        </div>
    `).join('')
}

// Render on load
renderReviews()

// Review Modal Controls
const reviewModal = document.getElementById('review-modal')
const btnOpenReview = document.getElementById('btn-open-review-modal')
const btnCloseReview = document.getElementById('close-review-modal')

if (btnOpenReview && reviewModal) {
    btnOpenReview.addEventListener('click', () => {
        const form = document.getElementById('review-form')
        const success = document.getElementById('review-success')
        if (form) form.style.display = 'block'
        if (success) success.style.display = 'none'
        // Reset star rating
        selectedStars = 0
        document.querySelectorAll('#star-rating-input .star-btn').forEach(s => s.classList.remove('active'))
        reviewModal.classList.add('active')
        playRoyalChime()
    })
}

if (btnCloseReview && reviewModal) {
    btnCloseReview.addEventListener('click', () => reviewModal.classList.remove('active'))
}

if (reviewModal) {
    reviewModal.addEventListener('click', e => {
        if (e.target === reviewModal) reviewModal.classList.remove('active')
    })
}

// Star Rating Interaction
let selectedStars = 0

document.querySelectorAll('#star-rating-input .star-btn').forEach(star => {
    star.addEventListener('mouseenter', () => {
        const val = parseInt(star.dataset.val)
        document.querySelectorAll('#star-rating-input .star-btn').forEach((s, i) => {
            s.classList.toggle('active', i < val)
        })
    })
    star.addEventListener('mouseleave', () => {
        document.querySelectorAll('#star-rating-input .star-btn').forEach((s, i) => {
            s.classList.toggle('active', i < selectedStars)
        })
    })
    star.addEventListener('click', () => {
        selectedStars = parseInt(star.dataset.val)
        document.querySelectorAll('#star-rating-input .star-btn').forEach((s, i) => {
            s.classList.toggle('active', i < selectedStars)
        })
    })
})

// Submit Review Function (called by form onsubmit)
window.submitReview = function() {
    const name = document.getElementById('rev-name-input')?.value.trim()
    const country = document.getElementById('rev-country-input')?.value.trim()
    const product = document.getElementById('rev-product-input')?.value
    const text = document.getElementById('rev-text-input')?.value.trim()

    if (!name || !country || !text || selectedStars === 0) {
        alert('Please fill in all fields and select a star rating.')
        return
    }

    const newReview = {
        name,
        country,
        product,
        stars: selectedStars,
        text,
        date: new Date().toISOString().split('T')[0]
    }

    const reviews = loadReviews()
    reviews.unshift(newReview) // Add to top
    saveReviews(reviews)
    renderReviews()

    // Show success
    const form = document.getElementById('review-form')
    const success = document.getElementById('review-success')
    if (form) form.style.display = 'none'
    if (success) success.style.display = 'block'

    playRoyalChime()

    // Auto-close after 2.5s
    setTimeout(() => {
        if (reviewModal) reviewModal.classList.remove('active')
    }, 2500)
}

// ================================================================
//  STATS COUNTER ANIMATION (Intersection Observer)
// ================================================================
function animateCounters() {
    document.querySelectorAll('.counter-num').forEach(el => {
        const target = parseFloat(el.dataset.target)
        const isDecimal = el.dataset.decimal === '1'
        const duration = 2000
        const step = 30
        const increment = target / (duration / step)
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString()
                clearInterval(timer)
            } else {
                el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString()
            }
        }, step)
    })
}

const statsGrid = document.querySelector('.stats-counter-grid')
if (statsGrid) {
    const statsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters()
                statsObserver.disconnect()
            }
        })
    }, { threshold: 0.2 })
    statsObserver.observe(statsGrid)
}

// ================================================================
//  GLOBAL WINDOW HANDLERS & EVENT DELEGATION FOR ALL BUTTONS
// ================================================================
window.toggleLanguage = function() {
    playRoyalChime()
    const newLang = currentLang === 'en' ? 'ar' : 'en'
    applyLanguage(newLang)
}

window.toggleSound = function() {
    isSoundOn = !isSoundOn
    const soundIcon = document.getElementById('sound-icon')
    const soundLabel = document.getElementById('sound-label')
    if (soundIcon) soundIcon.className = isSoundOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'
    if (soundLabel) soundLabel.textContent = isSoundOn ? 'MUSIC ON' : 'MUSIC OFF'
    if (isSoundOn) {
        startAmbientMusic()
        playRoyalChime()
    } else {
        stopAmbientMusic()
    }
}

window.openAuthModal = function() {
    const m = document.getElementById('authenticity-modal')
    if (m) m.classList.add('active')
    playRoyalChime()
}

window.closeAuthModal = function() {
    const m = document.getElementById('authenticity-modal')
    if (m) m.classList.remove('active')
}

window.openConciergeModal = function() {
    const m = document.getElementById('concierge-modal')
    const form = document.getElementById('concierge-form')
    const success = document.getElementById('concierge-success')
    if (form) form.style.display = 'block'
    if (success) success.classList.remove('active')
    if (m) m.classList.add('active')
    playRoyalChime()
}

window.closeConciergeModal = function() {
    const m = document.getElementById('concierge-modal')
    if (m) m.classList.remove('active')
}

window.closeSpecsModal = function() {
    const m = document.getElementById('specs-modal')
    if (m) m.classList.remove('active')
}

window.openReviewModal = function() {
    const reviewModal = document.getElementById('review-modal')
    const form = document.getElementById('review-form')
    const success = document.getElementById('review-success')
    if (form) form.style.display = 'block'
    if (success) success.style.display = 'none'
    selectedStars = 0
    document.querySelectorAll('#star-rating-input .star-btn').forEach(s => s.classList.remove('active'))
    if (reviewModal) reviewModal.classList.add('active')
    playRoyalChime()
}

window.closeReviewModal = function() {
    const reviewModal = document.getElementById('review-modal')
    if (reviewModal) reviewModal.classList.remove('active')
}

// Initial full language apply on page load
applyLanguage(currentLang)

// ================================================================
//  SCROLL-REVEAL ANIMATIONS (IntersectionObserver)
// ================================================================
const revealElements = document.querySelectorAll('.ws-feat-card, .ws-gal-item, .review-card, .ws-stat, .col-card')
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('revealed')
            }, idx * 80) // Staggered delay
            revealObserver.unobserve(entry.target)
        }
    })
}, { threshold: 0.1 })

revealElements.forEach(el => {
    el.classList.add('scroll-hidden')
    revealObserver.observe(el)
})

// ================================================================
//  3D TILT EFFECT on feature cards & gallery items
// ================================================================
document.querySelectorAll('.ws-feat-card, .ws-gal-item').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const rotateX = ((y / rect.height) - 0.5) * -8
        const rotateY = ((x / rect.width) - 0.5) * 8
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`
    })
    card.addEventListener('mouseleave', () => {
        card.style.transform = ''
    })
})

// ================================================================
//  FLOATING PARTICLES in reviews section
// ================================================================
const reviewsSection = document.getElementById('reviews')
if (reviewsSection) {
    const particlesContainer = document.createElement('div')
    particlesContainer.className = 'floating-particles'
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div')
        p.className = 'particle'
        p.style.left = Math.random() * 100 + '%'
        p.style.animationDelay = Math.random() * 8 + 's'
        p.style.animationDuration = (6 + Math.random() * 8) + 's'
        p.style.width = p.style.height = (2 + Math.random() * 4) + 'px'
        particlesContainer.appendChild(p)
    }
    reviewsSection.style.position = 'relative'
    reviewsSection.style.overflow = 'hidden'
    reviewsSection.appendChild(particlesContainer)
}