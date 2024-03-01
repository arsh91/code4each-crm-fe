<template>
  <div v-if="loginModalShow" class="modal-backdrop fade show"></div>
  <div
    class="modal fade"
    :class="{ show: loginModalShow, 'd-block': loginModalShow }"
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
                <a class="text-body forgotPassword" @click="showModal('forget')"
                  >Forgot password?</a
                >

                <div class="text-danger">{{ backendError }}</div>
              </div>
              <div class="dual-logo">
                <button
                  type="submit"
                  class="btn btn-primary1"
                  @click="login"
                  :disabled="isDisabledLoginUp"
                >
                  Login
                </button>
                <div v-if="loading" class="three-body3">
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
                @click="showModal('signup')"
              >
                Sign Up
              </button>
              <!-- <GoogleLogin :callback="googleSignUp" prompt auto-login /> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
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
import { useRouter, useRoute } from "vue-router";
const emits = defineEmits();

const props = defineProps({
  showLoginModal: {
      type:Boolean,
      default:false
    }
});

watch(() => props.showLoginModal, (newValue, oldValue) => {
  showSignUpModal.value = newValue; // Update the value in the ref if needed
});
</script>