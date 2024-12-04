<script setup>
import { ref } from "vue";
import Signup from "@/components/signup/signup.vue";
import AgencyDetailModal from "./AgencyDetailModal.vue";
import WordpressService from "@/service/WordpressService";
import Swal from "sweetalert2";

const showModal = ref(false);
const categories = ref([]);

const props = defineProps({
  buttonClass: String,
  paragraph: Boolean,
  dashboardData: Object,
});

const openModalWithCategories = async () => {
  try {
    // loading.value = true;
    const response = await WordpressService.getCategoryOption();
    if (response.status === 200 && response.data.success) {
      categories.value = response.data.categories;
      showModal.value = true;
    }
  } catch (error) {
    console.error(error);
    if (
      error.response.status === 403 &&
      error.response.data.message === "Your email address is not verified."
    ) {
      Swal.fire(
        "Done!",
        "Please Verify Your Email to Proceed Further!",
        "success"
      );
    }
  }
};
</script>
<template>
  <a
    href="#"
    class="btn"
    :class="buttonClass"
    @click="openModalWithCategories"
    data-toggle="modal"
    datatarget="#agencyModal"
  >
    <i class="la la-apple me-2 ic-2x d-inline-block"></i>
    <div class="d-inline-block" :class="paragraph ? 'text-center' : ''">
      <small class="d-block">7 DAY FREE TRIAL</small>
      <p v-if="paragraph">Take your agency online with us</p>
    </div>
  </a>
  <AgencyDetailModal
    :showModal="showModal"
    :categories="categories"
    @hide-modal="showModal = false"
    :dashboardData="dashboardData"
  />
</template>
