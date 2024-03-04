<template>
  <div v-if="showSignUpModal" class="modal-backdrop fade show"></div>
  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="Speedy Sites Signup"
    aria-hidden="true"
    :class="{ show: showSignUpModal, 'd-block': showSignUpModal }"
  >
    <div class="modal-dialog popup-model" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <div class="column" id="main">
            <button
              type="button"
              class="btn-close"
              @click="hideSignupModal"
              aria-label="Close"
            >
              <i class="fa fa-times"></i>
            </button>

            <h1>Start Your 7 Day Free Trial Today!</h1>

            <form class="form-start">
              <div class="main-form">
                <div class="form-group">
                  <label for="exampleInputName">Company Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="exampleInputName"
                    placeholder="Company  Name"
                    v-model="formData.company_name"
                  />
                  <div class="text-danger">{{ allErrors.company_name }}</div>
                </div>

                <div class="form-group">
                  <label for="exampleInputName">Name</label>
                  <input
                    type="name"
                    class="form-control"
                    id="exampleInputName"
                    placeholder="Name"
                    v-model="formData.name"
                  />
                  <div class="text-danger">{{ allErrors.name }}</div>
                </div>
              </div>
              <div class="main-form">
                <div class="form-group">
                  <label for="exampleInputEmail1">Email </label>
                  <input
                    type="email"
                    class="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    placeholder="Email"
                    v-model="formData.email"
                  />
                  <div class="text-danger">{{ allErrors.email }}</div>
                </div>
                <div class="form-group">
                  <label for="exampleInputPassword1">Phone no.</label>
                  <input
                    type="text"
                    class="form-control"
                    id="exampleInputPassword1"
                    placeholder="Phone Number..."
                    v-model="formData.phone"
                  />
                  <div class="text-danger">{{ allErrors.phone }}</div>
                </div>
              </div>
              <div class="form-group">
                <label for="exampleInputPassword1">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="exampleInputPassword1"
                  placeholder="Password"
                  v-model="formData.password"
                />
                <div class="text-danger">{{ allErrors.password }}</div>
              </div>
              <div class="text-danger">{{ backendError }}</div>
              <div class="form-group mt-3">
              </div>

              <div class="dual-logo">
                <button
                  type="submit"
                  class="btn btn-primary1"
                  @click="registerUser"
                  :disabled="isDisabledSignUp"
                >
                  Sign Up
                </button>
                <div v-if="loadingSignup" class="three-body3">
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
              <h3>Already have an account?</h3>
              <button
                type="button"
                @click="emits('showAnotherModal', 'login')"
                class="btn btn-primary"
              >
                Login
              </button>
              <GoogleLogin />
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
import GoogleLogin from "@/components/common/modals/GoogleLogin.vue";

const emits = defineEmits();
const props = defineProps({
  showSignUpModal: {
      type:Boolean,
      default:false
    }
});

watch(() => props.showSignUpModal, (newValue, oldValue) => {
  showSignUpModal.value = newValue; // Update the value in the ref if needed
});

const { Errors, resetForm, handleSubmit } = useForm();

const formData = ref({});
const showSignUpModal = ref(false);
const allErrors = ref({});
const backendError = ref("");
const isDisabledSignUp = ref(false);
const loadingSignup = ref(false);
const router = useRouter();


const validationSchema = yup.object({
  company_name: yup.string().required("Please enter your company name."),
  name: yup.string().required("Please enter your name."),
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
  phone: yup
    .string()
    .required("Please enter your phone number.")
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number."),
});

const registerUser = handleSubmit(async () => {
  try {
    isDisabledSignUp.value = true;
    loadingSignup.value = true;
    await validationSchema.validate(formData.value, { abortEarly: false });
    allErrors.value = {};

    const response = await WordpressService.registerUser(formData.value);
    if (response.status === 200 && response.data.success) {
      const token = response.data.token;
      localStorage.setItem("access_token", token);
      hideSignupModal();
      loadingSignup.value = false;
      router.push("/dashboard");
    }
  } catch (error) {
    const errors =
      error.inner && Array.isArray(error.inner)
        ? error.inner.reduce((acc, err) => {
            acc[err.path] = err.message;
            return acc;
          }, {})
        : {};

    allErrors.value = errors;
    if (error.response && error.response.data && error.response.data.errors) {
      allErrors.value = Object.fromEntries(
        Object.entries(error.response.data.errors).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value,
        ])
      );
    } else {
      backendError.value = error?.response?.data?.message;
    }
  }
  isDisabledSignUp.value = false;
  loadingSignup.value = false;
});

const hideSignupModal = () => {
  showSignUpModal.value = false;
  formData.value = {};
  allErrors.value = {};
  emits('closeModal');
};

</script>