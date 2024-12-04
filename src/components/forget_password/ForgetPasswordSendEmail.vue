<script setup>
import LoginInputDiv from "@/components/login/elements/LoginInputDiv.vue";
import { ref } from "vue";
import { useForm } from "vee-validate";
import * as yup from "yup";
import Swal from "sweetalert2";
import WordpressService from "@/service/WordpressService";

const email = ref("");
const errorMesssage = ref("");
const bakendError = ref("");

const emits = defineEmits();
const showLogin = () => {
  emits("show-login");
};

const { handleSubmit } = useForm({
  validationSchema: yup.object({
    email: yup.string().required().email(),
  }),
});

const sendMailToVerifyEmail = handleSubmit(async (values) => {
  try {
    const response = await WordpressService.ResetPassword.forgotPassword(
      values
    );
    if (response.status === 200 && response.data.success) {
      Swal.fire(
        "Done!",
        "Please check your inbox and verify your email!",
        "success"
      );
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      bakendError.value = Object.values(error.response.data.errors).flat();
    } else {
      console.error(error);
      errorMesssage.value = "server error try after some time";
    }
  }
});
</script>
<template>
  <form @submit.prevent="sendMailToVerifyEmail">
    <img
      src="https://raw.githubusercontent.com/sefyudem/Responsive-Login-Form/master/img/avatar.svg"
    />
    <h2 class="title">Welcome</h2>
    <div v-if="errorMesssage" class="error-message text-danger text-center">
      {{ errorMesssage }}
    </div>
    <div class="alert-danger">
      <div v-if="bakendError.length > 0">
        <ul>
          <li v-for="error in bakendError" :key="error" class="text-danger">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <LoginInputDiv
      class="one"
      iconClass="fa-user"
      fieldLabel="Email"
      fieldName="email"
    />

    <a href="#" @click="showLogin">Login</a>
    <button type="submit" class="btn-link">Send Mail</button>
  </form>
</template>