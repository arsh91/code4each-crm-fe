<template>
  <div v-if="showLoginModal" class="modal-backdrop fade show"></div>
  <div
    class="modal fade"
    :class="{ show: showLoginModal, 'd-block': showLoginModal }"
    tabindex="-1"
    role="dialog"
    aria-labelledby="Speedy Sites Login"
    aria-hidden="true"
  >
    <div class="modal-dialog popup-model" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <div class="column" id="main">
            <button
              type="button"
              class="btn-close"
              @click="hideLoginModal"
              aria-label="Close"
            >
              <i class="fa fa-times"></i>
            </button>

            <h1>Login</h1>

            <form class="form-start">
              <div class="main-form1">
                <div class="form-group">
                  <label for="exampleInputEmail1">Email </label>
                  <input
                    type="email"
                    class="form-control"
                    id="exampleInputEmail1"
                    placeholder="Email"
                    aria-describedby="emailHelp"
                    v-model="formDataLogin.email"
                  />
                  <div class="text-danger">{{ allErrorsLogin.email }}</div>
                </div>
                <div class="form-group">
                  <label for="exampleInputPassword1">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="exampleInputPassword1"
                    placeholder="Password"
                    v-model="formDataLogin.password"
                  />
                  <div class="text-danger">{{ allErrorsLogin.password }}</div>
                </div>
                <a class="text-body forgotPassword" @click="emits('showAnotherModal', 'forget')"
                  >Forgot password?</a
                >

                <div class="text-danger">{{ backendError }}</div>
              </div>
              <div class="dual-logo">
                <button
                  type="submit"
                  class="btn btn-primary1"
                  @click="login"
                  :disabled="underAction"
                >
                  Login
                </button>
                <div v-if="underAction" class="three-body3">
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                </div>
              </div>
            </form>
          </div>
          <div>
            <svg
              width="67px"
              height="578px"
              viewBox="0 0 67 578"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
            >
              <title>Path</title>
              <desc>Created with Sketch.</desc>
              <g
                id="Page-1"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
              >
                <path
                  d="M11.3847656,-5.68434189e-14 C-7.44726562,36.7213542 5.14322917,126.757812 49.15625,270.109375 C70.9827986,341.199016 54.8877465,443.829224 0.87109375,578 L67,578 L67,-5.68434189e-14 L11.3847656,-5.68434189e-14 Z"
                  id="Path"
                  fill="#0e1532"
                ></path>
              </g>
            </svg>
          </div>
          <div class="column" id="secondary">
            <div class="sec-content">
              <h2>Welcome Back!</h2>
              <h3>Don't have an account?</h3>
              <button
                type="button"
                class="btn btn-primary"
                @click="emits('showAnotherModal', 'signup')"
              >
                Sign Up
              </button>
              <GoogleLogin :callback="emits('googleLogin')" prompt auto-login />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  ref,
  defineProps,
  onMounted,
  defineEmits,
  inject,
  computed,
  watch,
} from "vue";
import { useForm } from "vee-validate";
import * as yup from "yup";
import WordpressService from "@/service/WordpressService";
import { useRouter } from "vue-router";

const { Errors, resetForm, handleSubmit } = useForm();

const allErrorsLogin = ref({})
const formDataLogin = ref({})
const emits = defineEmits();
const underAction = ref(false);
const router = useRouter();
const backendError = ref("");

const props = defineProps({
  showLoginModal: {
      type:Boolean,
      default:false
    }
});

const hideLoginModal = () => {
  formDataLogin.value = {};
  allErrorsLogin.value = {};
  emits("closeModal");
};

const validationSchemaLogin = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .matches(
      /^[^+]+@[^+]+\.[^+]+$/,
      "Email address cannot contain the '+' character."
    )
    .required("Please enter your email address."),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(20, "Password must not exceed 20 characters.")
    .required("Please enter your password."),
});

const login = handleSubmit(async () => {
  try {
    underAction.value = true;
    await validationSchemaLogin.validate(formDataLogin.value, {
      abortEarly: false,
    });
    allErrorsLogin.value = {};
    const response = await WordpressService.loginUser(formDataLogin.value);
    if (response.status === 200 && response.data.success) {
      const token = response.data.token;
      localStorage.setItem("access_token", token);
      const fetchDashboardData = await WordpressService.fetchDashboardData();
      if (
        fetchDashboardData.status === 200 &&
        fetchDashboardData.data.success
      ) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  } catch (error) {
    const errors =
      error.inner && Array.isArray(error.inner)
        ? error.inner.reduce((acc, err) => {
            acc[err.path] = err.message;
            return acc;
          }, {})
        : {};

    allErrorsLogin.value = errors;
    if (error.response && error.response.data && error.response.data.errors) {
      allErrorsLogin.value = Object.fromEntries(
        Object.entries(error.response.data.errors).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value,
        ])
      );
    } else {
      backendError.value = error?.response?.data?.message;
    }
  }
  underAction.value = false;
});

</script>