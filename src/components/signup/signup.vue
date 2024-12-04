<script setup lang="ts">
import { reactive, onBeforeMount, ref } from "vue";
import SignupModalVue from "./elements/SignupModal.vue";
import { useForm } from "vee-validate";
import * as yup from "yup";
import WordpressService from "@/service/WordpressService";
import { useRouter } from "vue-router";

const loading = ref(false);
const router = useRouter();

const emits = defineEmits();
const { handleSubmit } = useForm({
  validationSchema: yup.object({
    company_name: yup.string().required("company name is required."),
    name: yup.string().required("user name is required."),
    email: yup.string().required().email(),
    phone: yup
      .string()
      .required()
      .matches(/^\d+$/, "Must be a number")
      .max(10)
      .min(10),
    password: yup.string().required().min(6),
  }),
});

const registerUser = handleSubmit(async (values) => {
  loading.value = true;
  try {
    const response = await WordpressService.registerUser(values);
    if (response.status === 200 && response.data.success) {
      const token = response.data.token;
      localStorage.setItem("access_token", token);
      hideModal();
      loading.value = false;
      router.push("/dashboard");
    }
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
});

const localState = reactive({
  showModal: false,
});

const googleSignUp = async (credential: string) => {
  loading.value = true;
  try {
    const response = await WordpressService.GoogleLogin.googleSignUp({
      id_token: credential,
    });
    if (response.status === 200 && response.data.success) {
      const token = response.data.access_token;
      localStorage.setItem("access_token", token);
      loading.value = false;
      router.push("/dashboard");
    }
  } catch (error) {
    loading.value = false;
    console.error(error);
  }
};

onBeforeMount(() => {
  localState.showModal = true;
});

const hideModal = () => {
  localState.showModal = false;
  emits("hide-modal");
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
  <SignupModalVue
    :showModal="localState.showModal"
    @hide-modal="hideModal"
    @submit="registerUser"
    @google="googleSignUp"
  />
</template>
<style>
.spinner-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>