<script setup>
import {
  ref,
  onMounted,
} from "vue";
import WordpressService from "@/service/WordpressService";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "@/stores/store";
import FlashMessage from "@/components/common/FlashMessage.vue";
import AuthSignupModal from "@/components/common/modals/AuthSignupModal.vue";
import AuthLoginModal from "@/components/common/modals/AuthLoginModal.vue";
import EmailResetModal from "@/components/common/modals/EmailResetModal.vue";
import AlertForSignupModal from "@/components/common/modals/AlertForSignupModal.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();
const showSignUpModal = ref(false);
const forgetModalShow = ref(false);
const loginModalShow = ref(false);
const backendError = ref("");
const ModalShowing = ref(false);
const alertShow = ref(false);
const loginExist = ref(false);

const showModal = (modal) => {
  hideModal();
  ModalShowing.value = true;
  backendError.value = "";
  if (modal === "forget") {
    loginModalShow.value =
      showSignUpModal.value =
      alertShow.value =
        false;
    forgetModalShow.value = true;
  } else if (modal === "login") {
    loginModalShow.value = true;
    forgetModalShow.value =
      showSignUpModal.value =
      alertShow.value =
        false;
  } else if (modal === "signup") {
    showSignUpModal.value = true;
    forgetModalShow.value =
      loginModalShow.value =
      alertShow.value =
        false;
  } else if (modal === "alert") {
    alertShow.value = true;
    forgetModalShow.value =
      loginModalShow.value =
      showSignUpModal.value =
        false;
  } else if(modal === "feedback") {
    store.updateFeedbackModalStore();
  }
};

const hideModal = () => {
  ModalShowing.value = false;
  forgetModalShow.value = false;
  loginModalShow.value = false;
  alertShow.value = false;
};

const googleSignUp = async (response) => {
  try {
    const apiResponse = await WordpressService.GoogleLogin.googleSignUp({
      id_token: response.credential,
    });
    if (apiResponse.status === 200 && apiResponse.data.success) {
      const token = apiResponse.data.access_token;
      localStorage.setItem("access_token", token);
      router.push("/dashboard");
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(async () => {
  window.onload = () => {
  setTimeout(() => {
    if (!(showSignUpModal.value || loginModalShow.value || forgetModalShow.value) && !loginExist.value) {
      showModal("alert");
    }
  }, 15000);
  };
  const storedToken = localStorage.getItem("access_token");
  if (storedToken) {
    loginExist.value = storedToken;
  }
  if (route.query.login) {
    loginModalShow.value = true;
  }
});

const navigate = () => {
  router.push("/dashboard");
};

const navigateToHome = () => {
  router.push("/");
};

const handleShowModal = (modal) => {
  if(modal === 'signup'){
    alertShow.value = false
  }
 showModal(modal)
};

</script>
<template>
  <FlashMessage :visible="store.flashMeassge" v-if="store.flashMeassge" />
  <header class="header-section">
    <nav
      class="navbar navbar-light bg-white navbar-static-top navbar-expand-lg header-sticky"
    >
      <div class="container">
        <button
          type="button"
          class="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target=".navbar-collapse"
        >
          <i class="fa fa-align-left"></i>
        </button>
        <a
          class="navbar-brand-logo"
          @click="navigateToHome"
          style="cursor: pointer"
        >
          <img class="img-fluid" src="/images/logo-beta.png" alt="logo" />
        </a>
        <div class="add-listing d-none d-sm-block">
          <a
            v-if="!loginExist"
            class="btn btn-lg button-trial rounded-pill hover-top"
            @click="showModal('login')"
            >LOGIN / SIGNUP
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </a>
          <a
            v-else
            class="btn btn-lg button-trial rounded-pill hover-top"
            @click="navigate"
            >DASHBOARD
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </a>
        </div>
      </div>
    </nav>
    <section class="home-banner" id="home">
      <div
        class="bg-holder"
        style="
          background-image: url('images/hero-bg.png');
          background-position: bottom;
          background-size: cover;
        "
      ></div>
      <div class="container position-relative">
        <div class="row align-items-center py-8">
          <div class="col-md-6 col-lg-6 order-md-1 text-center text-md-end">
            <img class="img-fluid" src="/images/hero-img.png" />
          </div>
          <div class="col-md-6 col-lg-6 text-center text-md-start">
            <span
              class="badge bg-light rounded-pill text-dark align-items-center d-flex flex-row-reverse justify-content-end mx-auto mx-md-0 ps-0 w-sm-50 w-md-75 w-xl-50 mb-3"
              >Average website creation time on SpeedySites is 5 SEC<img
                class="img-fluid float-start me-3"
                src="/images/arrow-right.png"
                alt=""
            /></span>
            <h1 class="mb-4 display-3 fw-bold lh-sm">
              Build Your Website. <br /><span
                class="d-block d-lg-none d-xl-block"
                style="color: #1c316a"
                >In Less Then 10 Seconds</span
              >
            </h1>
            <p class="mt-3 mb-4">
              Create your website with no coding skills and no designing
              expertise!
              <br class="d-none d-lg-block" />
              SpeedySites will design a completely unique website that you can
              start using right away.
            </p>
            <div class="buttons-design">
              <a
                class="btn btn-lg button-trial rounded-pill hover-top"
                @click="showModal('signup')"
                >Try for free <span></span>
                <span></span>
                <span></span>
                <span></span>
              </a>
              <!-- <a
                class="btn-2 btn-link ps-md-4 hover-slide-right"
                href="#"
                role="button"
              >
                Watch demo video</a
              > -->
              <h5>
                <i class="fa fa-check" aria-hidden="true"></i> Free Trial . No
                Credit Card Required
              </h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  </header>
  <!----- about section design code------>
  <section class="about-section">
    <div class="container">
      <div class="row d-flex justify-content-center">
        <div class="col-12">
          <h2>Build A Fully Functional Website</h2>
          <p>
            The first platform that combines both under one place working
            seamlessly.
          </p>
        </div>
      </div>
      <div class="row">
        <div class="about-area">
          <div class="col-lg-5 col-md-6">
            <div class="textarea">
              <h3>Do Anything With Just Your Mouse</h3>
              <h4>Create the design you always wanted!</h4>
              <p class="abouttext">
                "Speedysites’ drag and drop builder is extremely easy to use and
                we were finally able to create the exact website we had in
                mind!"
              </p>
              <div class="custom-button1" id="button-hover">
                <a
                  class="btn btn-lg button-trial rounded-pill hover-top"
                  @click="showModal('signup')"
                  >Try for free <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </a>
                <h5>
                  <i class="fa fa-check" aria-hidden="true"></i> Free Trial . No
                  Credit Card Required
                </h5>
              </div>
            </div>
          </div>
          <div class="col-lg-7 col-md-6">
            <div class="about-img">
              <img src="/images/datailedimg1.png" />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="about-area1">
          <div class="col-lg-6 col-md-6">
            <div class="about-img">
              <img src="/images/aboutimg.png" />
            </div>
          </div>
          <div class="col-lg-6 col-md-6">
            <div class="textarea1">
              <h3>Think of SpeedySites as your personal website developer</h3>
              <p class="abouttext2">
                Where you partner with SpeedySites who grasp your business
                objectives and design a customized website aligned with your
                brand guidelines, ensuring continuous support.
              </p>
              <div
                class="type1 icon-section"
                style="background: transparent; padding: 6px"
              >
                <div class="icon-header-wrapper">
                  <div class="icon border-color-secondary1">
                    <i
                      class="icon-section-icon fa fa-hand-o-right color-secondary1"
                    ></i>
                  </div>
                  <div class="icon-title text-widget-content">
                    <h4 style="line-height: 1.4">
                      <span style="font-size: 20px">Fast & Easy To Use</span>
                    </h4>
                  </div>
                </div>
                <div class="icon-content">
                  <div class="text-widget-content">
                    <!--<p>
                      The first platform that allows you to A/B test your
                      website pages thanks to the built-in funnels.
                    </p>-->
                    <div class="custom-list">
                      <ul>
                        <li>
                          <strong>Step 1:</strong> Login / Signup to SpeedySites
                        </li>
                        <li>
                          <strong>Step 1:</strong> Enter the name of your
                          business
                        </li>
                        <li>
                          <strong>Step 2:</strong> Submit keywords describing
                          your business
                        </li>
                        <li>
                          <strong>Step 3:</strong> Get your website ready in
                          seconds!
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="custom-button1" id="button-hover">
                <a
                  class="btn btn-lg button-trial rounded-pill hover-top"
                  @click="showModal('signup')"
                  >Try for free <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </a>
                <h5>
                  <i class="fa fa-check" aria-hidden="true"></i> Free Trial . No
                  Credit Card Required
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- --------about section design code end----------->
  <div class="feature-icon-wrapper section-space--ptb_100">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <div class="section-title-wrap text-center section-space--mb_40">
            <!--<h6 class="section-sub-title mb-20">Industries we Serve</h6>-->
            <h3 class="heading">More Than Just A Website Builder <br /></h3>
            <h5>
              <span class="text-color-primary">
                The most unique and powerful platform on the planet as your own
              </span>
            </h5>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="feature-list__two">
            <div class="row">
              <div
                class="col-lg-4 col-md-6 wow move-up animated"
                style="visibility: visible"
              >
                <div class="ht-box-icon style-02 single-svg-icon-box">
                  <div class="icon-box-wrap">
                    <div class="icon">
                      <i class="fa fa-heart-o"></i>
                    </div>
                    <div class="content">
                      <h5 class="heading">Custom Templates</h5>
                      <div class="text">
                        Enjoy unlimited freedom to design numerous templates for
                        websites, pages, blocks, pop-ups, and emails to suit
                        your needs.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="col-lg-4 col-md-6 wow move-up animated"
                style="visibility: visible"
              >
                <div class="ht-box-icon style-02 single-svg-icon-box">
                  <div class="icon-box-wrap">
                    <div class="icon">
                      <i class="fa fa-suitcase" aria-hidden="true"></i>
                    </div>
                    <div class="content">
                      <h5 class="heading">Custom Branding</h5>
                      <div class="text">
                        Tailor your platform to reflect your brand identity with
                        features like adding your logo, domain, and custom
                        styling.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="col-lg-4 col-md-6 wow move-up animated"
                style="visibility: visible"
              >
                <div class="ht-box-icon style-02 single-svg-icon-box">
                  <!-- ht-box-icon Start -->
                  <div class="icon-box-wrap">
                    <div class="icon">
                      <i class="fa fa-shield" aria-hidden="true"></i>
                    </div>
                    <div class="content">
                      <h5 class="heading">Drag & Drop Building Editor</h5>
                      <div class="text">
                        Create pages as fast as humanly possible with our drag &
                        drop builder.
                      </div>
                    </div>
                  </div>
                  <!-- ht-box-icon End -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-12 d-flex">
          <div class="main-div">
            <div
              class="feature-list-button-box mt-30 text-center"
              id="button-hover"
            >
              <a
                class="btn btn-lg button-trial rounded-pill hover-top"
                @click="showModal('signup')"
                >TRY FOR FREE
                <span></span>
                <span></span>
                <span></span>
                <span> </span>
              </a>
            </div>
            <div class="add-listing d-none d-sm-block">
              <a
                class="btn btn-lg button-trial rounded-pill hover-top"
                @click="showModal('feedback')"
                >CONTACT US
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <section class="email-custom">
    <div class="container-fluid grid-row">
      <div class="grid-customsection">
        <div class="email-imgdiv">
          <img src="/images/datailedimg3.png" style="width: 100%" />
        </div>
        <div class="email-textdiv">
          <div class="email-textdiv1">
            <h4>Email Marketing & Automations</h4>
            <h1>Send Emails. Engage With Your Users.</h1>
            <div class="email-textdiv2">
              <p>
                Create your emails and campaigns easier than ever before.
                Automate everything with just a few clicks.
              </p>
            </div>
            <div class="email-textdiv3">
              <div class="custom-list">
                <i class="fa fa-hand-o-right"></i>
                <h3>Drag and drop email builder</h3>
              </div>
              <div class="custom-list">
                <i class="fa fa-hand-o-right"></i>
                <h3>Automation flow builder</h3>
              </div>
              <div class="custom-list">
                <i class="fa fa-hand-o-right"></i>
                <h3>Build your email lists and segments</h3>
              </div>
              <div class="custom-3" id="button-hover">
                <a
                  class="btn btn-lg button-trial rounded-pill hover-top"
                  @click="showModal('signup')"
                  >Try for free
                  <span></span>
                  <span></span>
                  <span></span>
                  <span> </span>
                </a>
                <h5>
                  <i class="fa fa-check" aria-hidden="true"></i> Free Trial . No
                  Credit Card Required
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <AuthSignupModal :showSignUpModal="showSignUpModal" @closeModal="showSignUpModal=false" @showAnotherModal="handleShowModal" @googleLogin="googleSignUp"></AuthSignupModal>
  <AuthLoginModal :showLoginModal="loginModalShow" @closeModal="loginModalShow=false" @showAnotherModal="handleShowModal" @googleLogin="googleSignUp" ></AuthLoginModal>
  <EmailResetModal :showResetModal="forgetModalShow" @closeModal="forgetModalShow=false" @showAnotherModal="handleShowModal" ></EmailResetModal>
  <AlertForSignupModal :alertShowModal="alertShow" @closeModal="alertShow=false" @showAnotherModal="handleShowModal"></AlertForSignupModal>
  <GoogleLogin :callback="googleSignUp" prompt auto-login />
</template>

