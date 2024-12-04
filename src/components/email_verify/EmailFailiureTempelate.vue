<script setup>
import { ref, defineProps, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  error: String,
});

const navigateToLogin = () => {
  const queryParams = { login: true };
  router.push({ path: "/home", query: queryParams });
};
</script>

<template>
  <section class="mail-error">
    <div class="card">
      <div
        style="
          border-radius: 200px;
          height: 200px;
          width: 200px;
          background: #f8faf5;
          margin: 0 auto;
        "
      >
        <i class="Crossmark">X</i>
      </div>
      <h1>error</h1>
      <p class="text-danger">
        {{ props.error }}
      </p>
      <button class="btn btn-success btn-block" @click="navigateToLogin">
        Login
      </button>
    </div>
  </section>
</template>