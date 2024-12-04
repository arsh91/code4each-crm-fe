<template>
  <div v-if="showResetModal" class="modal-backdrop fade show"></div>
  <div
    class="modal fade"
    :class="{ show: showResetModal, 'd-block': showResetModal }"
    id="exampleModalLabel"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog popup-model" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <div class="column" id="main">
            <button
              type="button"
              class="btn-close"
              @click="hideForgetModal"
              aria-label="Close"
            >
              <i class="fa fa-times"></i>
            </button>

            <h1>Forgot Password?</h1>

            <form class="form-start">
              <div class="main-form1">
                <div class="form-group">
                  <label for="exampleInputEmail1">Email </label>
                  <input
                    type="email"
                    class="form-control"
                    id="exampleInputEmail1"
                    placeholder="Enter Registered Email"
                    aria-describedby="emailHelp"
                    v-model="formDataForget.email"
                  />
                </div>
                <div class="text-danger">{{ allErrorsForget.email }}</div>
                <div class="text-danger">{{ backendError }}</div>
              </div>

              <div class="dual-logo">
                <button
                  type="submit"
                  class="btn btn-primary1"
                  @click="sendMailToVerifyEmail"
                  :disabled="isForgetAction"
                >
                  Email Reset Link
                </button>
                <div v-if="isForgetAction" class="three-body3">
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
import { useStore } from "@/stores/store";

const store = useStore();
const emits = defineEmits();
const props = defineProps({
  showResetModal: {
      type:Boolean,
      default:false
    }
});

const { Errors, resetForm, handleSubmit } = useForm();
const formDataForget = ref({});
const allErrorsForget = ref({});
const backendError = ref("");
const isForgetAction = ref(false);

const validationSchemaForget = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .matches(
      /^[^+]+@[^+]+\.[^+]+$/,
      "Email address cannot contain the '+' character."
    )
    .required("Please provide your email address."),
});

const sendMailToVerifyEmail = handleSubmit(async () => {
  try {
    isForgetAction.value = true;
    await validationSchemaForget.validate(formDataForget.value, {
      abortEarly: false,
    });
    allErrorsForget.value = {};
    const response = await WordpressService.ResetPassword.forgotPassword(
      formDataForget.value
    );
    if (response.status === 200 && response.data.success) {
      hideForgetModal();
      store.updateFlashMeassge(
        true,
        "Please check your inbox and verify your email!"
      );
    }
  } catch (error) {
    const errors =
      error.inner && Array.isArray(error.inner)
        ? error.inner.reduce((acc, err) => {
            acc[err.path] = err.message;
            return acc;
          }, {})
        : {};

    allErrorsForget.value = errors;
    if (error.response && error.response.data && error.response.data.errors) {
      allErrorsForget.value = Object.fromEntries(
        Object.entries(error.response.data.errors).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value,
        ])
      );
    } else {
      backendError.value = error?.response?.data?.message;
    }
  }
  isForgetAction.value = false;
});


const hideForgetModal = () => {
  formDataForget.value = {};
  allErrorsForget.value = {};
  emits('closeModal');
};
</script>