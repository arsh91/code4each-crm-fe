<template>
    <div class="footer-section">
    <div class="container w-container">
      <div class="subscription-wrapper">
        <div class="subscription-text-side">
          <h3 class="subscription-heading">
            Questions? Feedback? Contact us for prompt assistance and support
          </h3>
        </div>
        <div class="subscription-form-side">
          <a
            class="btn btn-lg button-trial rounded-pill hover-top"
            @click=" store.updateFeedbackModalStore()"
            >CONTACT US
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </a>
        </div>
      </div>
      <div class="footer-wrapper">
        <div class="footer-single-block footer-logo-blojg">
          <div class="footer-logo-block">
            <img
              src="/images/logo-beta.png"
              loading="lazy"
              alt="Footer Logo Image"
              class="footer-logo-image"
            />
          </div>
          <div class="footer-content">
            <p class="footer-details">
              Instant Websites, Zero Coding, Maximum Impact!
            </p>
          </div>
        </div>
        <hr class="my-4" />
        <div class="footer-single-block address-block">
          <div class="footer-title-block">
            <h3 class="footer-heading">
              Social links <span class="color-shape"></span>
            </h3>
          </div>

          <div class="footer-social-network-block">
            <a
              target="_blank"
              :href="config.FACEBOOK_URL"
              class="social-single-link w-inline-block"
            >
              <i class="fa fa-facebook-f"></i>
            </a>
            <a
              :href="config.INSTAGRAM_URL"
              target="_blank"
              class="social-single-link w-inline-block"
            >
              <i class="fa fa-instagram"></i>
            </a>
            <a
              :href="config.YOUTUBE_URL"
              target="_blank"
              class="social-single-link w-inline-block"
            >
              <i class="fa fa-youtube-play"></i>
            </a>
          </div>
          <div class="footer-social-network-block"></div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-bottom-text">
          Speedysites.<a> All Rights Reserved - Privacy Policy </a>
        </div>
      </div>
    </div>
  </div>
  <FeedbackModal @closeModal="store.updateFeedbackModalStore()" ></FeedbackModal>
</template>
<script setup>
import {
  ref,
  defineProps,
  onMounted,
  provide,
  inject,
  computed,
  watch,
} from "vue";
import config from "/config.js";
import FeedbackModal from "@/components/common/modals/FeedbackModal.vue";
import { useStore } from "@/stores/store";

const store = useStore();

</script>
