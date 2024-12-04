<template>
  <section class="login-section" id="loginPage">
    <div class="d-flex align-items-center justify-content-end">
      <router-link to="/" class="backBtn">Back</router-link>
    </div>
    <img
      class="wave"
      src="https://raw.githubusercontent.com/sefyudem/Responsive-Login-Form/master/img/wave.png"
    />
    <div class="login-wrapper">
      <div class="container">
        <div class="img">
          <img
            src="https://raw.githubusercontent.com/sefyudem/Responsive-Login-Form/master/img/bg.svg"
          />
        </div>
        <div class="login-content">
          <ForgetPasswordSendEmail
            v-if="showForgetForm"
            @show-login="showForgetForm = false"
          />
          <div v-else>
            <form @submit.prevent="login">
              <img
                src="https://raw.githubusercontent.com/sefyudem/Responsive-Login-Form/master/img/avatar.svg"
              />
              <h2 class="title">Welcome</h2>

              <!--**************** Display loginError message if it's not empty ********-->
              <div
                v-if="errorMesssage"
                class="error-message text-danger text-center"
              >
                {{ errorMesssage }}
              </div>
              <div class="alert-danger">
                <div v-if="bakendError.length > 0">
                  <ul>
                    <li
                      v-for="error in bakendError"
                      :key="error"
                      class="text-danger"
                    >
                      {{ error }}
                    </li>
                  </ul>
                </div>
              </div>
              <LoginInputDiv
                class="one"
                iconClass="fa-user"
                fieldLabel="Username"
                fieldName="email"
              />
              <LoginInputDiv
                class="pass"
                iconClass="fa-lock"
                fieldLabel="Password"
                fieldName="password"
                type="password"
              />

              <a href="#" class="forgetLink" @click="handleForgotPasswordClick"
                >Forgot Password?</a
              >
              <button type="submit" class="btn-link">Login</button>
              <GoogleLogin :callback="googleSignUp" prompt auto-login />
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import WordpressService from "@/service/WordpressService";
import { useForm } from "vee-validate";
import * as yup from "yup";
import LoginInputDiv from "@/components/login/elements/LoginInputDiv.vue";
import Alert from "@/components/common/Alert.vue";
import ForgetPasswordSendEmail from "@/components/forget_password/ForgetPasswordSendEmail.vue";

const loginSuccess = ref(false);
const showForgetForm = ref(false);

const bakendError = ref("");
const errorMesssage = ref("");
const router = useRouter();

const email = ref("");
const password = ref("");
const { handleSubmit } = useForm({
  validationSchema: yup.object({
    email: yup.string().required().email(),
    password: yup.string().required().min(6),
  }),
});

const login = handleSubmit(async (values) => {
  try {
    const response = await WordpressService.loginUser(values);
    if (response.status === 200 && response.data.success) {
      const token = response.data.token;
      localStorage.setItem("access_token", token);
      const fetchDashboardData = await WordpressService.fetchDashboardData();
      if (
        fetchDashboardData.status === 200 &&
        fetchDashboardData.data.success
      ) {
        loginSuccess.value = true;
        router.push("/dashboard");
      } else {
        loginSuccess.value = false;
        router.push("/login");
      }
    } else {
      errorMesssage.value = response.data.message; // Set an error message
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      bakendError.value = Object.values(error.response.data.errors).flat();
    } else {
      console.error(error);
      errorMesssage.value = error?.response?.data?.message; // Set an error message
    }
  }
});

const handleForgotPasswordClick = async () => {
  showForgetForm.value = true;
};

const googleSignUp = async (response: any) => {
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
</script>
<style >
@import "../../assets/login.css";
</style>