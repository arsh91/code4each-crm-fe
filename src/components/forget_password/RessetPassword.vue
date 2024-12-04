<template>
  <section class="rest-in">
    <div class="container">
      <div class="resetin-content">
        <div class="resetin-form">
          <div class="horizontal-info-container text-center">
            <img src="/images/speedylogo.png" />
            <p class="horizontal-heading">Reset your password</p>
          </div>
          <form>
            <div class="form-group">
              <label for="Password">Password</label>
              <input
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                id="exampleInputpassword"
                name="firstname"
                placeholder="Enter  your new  password"
                v-model="formData.password"
              />
              <span
                v-if="!showPassword"
                toggle="#password-field"
                class="fa fa-fw fa-eye field-icon toggle-password"
                @click="showPassword = !showPassword"
              ></span>
              <span
                v-else
                toggle="#password-field"
                class="fa fa-eye-slash field-icon toggle-password"
                @click="showPassword = !showPassword"
              ></span>
              <div class="text-danger">{{ allErrorsReset.password }}</div>
            </div>
            <div class="form-group">
              <label for="Confirm  password">Confirm password</label>
              <input
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                id="exampleInputConfirm  password"
                name="lastname"
                placeholder="Enter your Confirm  password "
                v-model="formData.confirm_password"
              />
              <div class="text-danger">
                {{ allErrorsReset.confirm_password }}
              </div>
            </div>
            <div
              v-if="showSuccessMeassge"
              class="mt-3"
              style="
                background-color: #dff0d8;
                color: #3c763d;
                padding: 10px;
                border: 1px solid #d6e9c6;
              "
            >
              Password Resst successfully!
            </div>
            <div class="text-danger">{{ backendError }}</div>

            <div class="form-group form-button">
              <div v-if="loading" class="three-body5">
                <div class="three-body__dot"></div>
                <div class="three-body__dot"></div>
                <div class="three-body__dot"></div>
              </div>
              <button
                type="submit"
                name="signin"
                id="signin"
                class="form-submit"
                @click="resetPassword"
                :disabled="isForgetAction"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        <a class="back-reset" @click="navigate">
          <i class="fa fa-hand-o-right"></i>Back to home page
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import WordpressService from "@/service/WordpressService";
import { useForm } from "vee-validate";
import * as yup from "yup";
import LoginInputDiv from "@/components/login/elements/LoginInputDiv.vue";
import ForgetPasswordSendEmail from "@/components/forget_password/ForgetPasswordSendEmail.vue";
import Swal from "sweetalert2";
import "@/assets/css/reset.css";

const route = useRoute();
const loginSuccess = ref(false);
const showForgetForm = ref(false);
const isForgetAction = ref(false);
const showSuccessMeassge = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const backendError = ref("");
const allErrorsReset = ref({});
const formData = ref({});

const bakendError = ref("");
const errorMesssage = ref("");
const router = useRouter();

const email = ref(route.query.email);
const password = ref("");
const { Errors, resetForm, handleSubmit } = useForm();

const validationSchema = yup.object({
  password: yup
    .string()
    .transform((value) => value.trim())
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must not exceed 20 characters")
    .required("Password is a required field"),
  confirm_password: yup
    .string()
    .transform((value) => value.trim())
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is a required field"),
});

const resetPassword = handleSubmit(async () => {
  try {
    loading.value = true;
    isForgetAction.value = true;
    await validationSchema.validate(formData.value, {
      abortEarly: false,
    });
    allErrorsReset.value = {};
    const response = await WordpressService.ResetPassword.resetPassword({
      email: route.query.email,
      token: route.query.token,
      password: formData.value.password,
      password_confirmation: formData.value.confirm_password,
    });
    if (response.status === 200 && response.data.success) {
      showSuccessMeassge.value = true;
      formData.value = {};
      setTimeout(() => {
        showSuccessMeassge.value = false;
      }, 5000);
    }
  } catch (error) {
    const errors =
      error.inner && Array.isArray(error.inner)
        ? error.inner.reduce((acc, err) => {
            acc[err.path] = err.message;
            return acc;
          }, {})
        : {};

    allErrorsReset.value = errors;
    if (error.response && error.response.data && error.response.data.errors) {
      allErrorsReset.value = Object.fromEntries(
        Object.entries(error.response.data.errors).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value,
        ])
      );
    } else if (
      error.response &&
      error.response.data &&
      error.response.data.error
    ) {
      backendError.value = error.response.data.error;
    }
  }
  loading.value = false;
  isForgetAction.value = false;
});
const navigate = () => {
  router.push("/");
};
</script>
