<script setup>
import { ref, onMounted } from "vue";
import EmailFailiureTempelate from "@/components/email_verify/EmailFailiureTempelate.vue";
import EmailSuccessTempelate from "@/components/email_verify/EmailSuccessTempelate.vue";
import WordpressService from "@/service/WordpressService";
import { useRoute, useRouter } from "vue-router";

const verified = ref(false);
const loading = ref(true);
const route = useRoute();
const errorMesssage = ref();
const meassage = ref();
onMounted(async () => {
  await verifyEmail();
});

const verifyEmail = async () => {
  try {
    const response = await WordpressService.VerifyEmail.verifyEmail(
      {
        expires: route.query.expires,
        hash: route.query.hash,
        signature: route.query.signature,
      },
      route.query.id
    );
    if (response.status === 200 || response.status === 400) {
      verified.value = true;
      meassage.value = response.data.message;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      errorMesssage.value = error.response.data.error;
    }
  }
  loading.value = false;
};
</script>
<template>
  <div v-if="loading">
    <div class="spinner-container">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
  <div v-else>
    <EmailSuccessTempelate v-if="verified" :meassage="meassage" />
    <EmailFailiureTempelate v-else :error="errorMesssage" />
  </div>
</template>
<style>
@import "@/assets/email.css";
</style>