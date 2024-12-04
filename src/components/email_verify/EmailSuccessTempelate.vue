<script setup>
import { ref, defineProps } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  meassage: String,
});

const navigateToLogin = () => {
  const queryParams = { login: true };
  router.push({ path: "/home", query: queryParams });
};
</script>
<template>
  <section class="mail-verfication">
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
        <i class="checkmark">✓</i>
      </div>
      <h1>Success</h1>
      <p>
        Congratulations<br />
        {{ meassage }}
      </p>
      <button class="btn btn-success btn-block" @click="navigateToLogin">
        Login
      </button>
    </div>
  </section>
</template>