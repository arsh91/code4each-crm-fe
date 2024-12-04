<template>
<div v-if="feedbackModalShow" class="modal-backdrop fade show"></div>
<div
    class="modal feedback-model fade"
    id="modalContactForm"
    tabindex="-1"
    role="dialog"
    aria-labelledby="Feedback SpeedySites"
    aria-hidden="true"
    :class="{ show: feedbackModalShow, 'd-block': feedbackModalShow }"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header" style="border: 0">
          <button
            type="button"
            class="btn-close"
            @click="hideFeedbackModal"
            aria-hidden="true"
          ></button>
        </div>
        <div class="modal-body mx-3">
          <div class="card-layout layout-medium">
            <div class="content">
              <div class="close-button"></div>

              <h1 class="title">Contact Us</h1>
              <label data-error="wrong" data-success="right" for="form34"
                >Name*</label
              >
              <input
                type="text"
                class="form-control"
                id="field1"
                placeholder="Name"
                v-model="feedbackValues.name"
              />
              <div class="text-danger">{{ allErrorsFeedback.name }}</div>
              <label data-error="wrong" data-success="right" for="form34"
                >Email*</label
              >
              <input
                type="text"
                class="form-control"
                id="field1"
                placeholder="Email"
                v-model="feedbackValues.email"
              />
              <div class="text-danger">{{ allErrorsFeedback.email }}</div>
              <label data-error="wrong" data-success="right" for="form34"
                >Phone*</label
              >
              <input
                type="text"
                class="form-control"
                id="field1"
                placeholder="Phone"
                v-model="feedbackValues.phone"
              />
              <div class="text-danger">{{ allErrorsFeedback.phone }}</div>
              <label data-error="wrong" data-success="right" for="form34"
                >Message*</label
              >
              <textarea
                class="form-control input"
                placeholder="Write Your Message.."
                rows="5"
                v-model="feedbackValues.message"
              ></textarea>
              <div class="text-danger">{{ allErrorsFeedback.message }}</div>
              <div
                v-if="feedbackMsg"
                class="mt-3"
                style="
                  background-color: #dff0d8;
                  color: #3c763d;
                  padding: 10px;
                  border: 1px solid #d6e9c6;
                "
              >
                Thank you for reaching out! Your message has been successfully
                submitted. We'll get back to you as soon as possible.
              </div>
              <div class="user-actions">
                <div v-if="feedbackLoading" class="three-body3">
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                </div>
                <button class="feedback-btn-primary" @click="submitFeedback">
                  Send
                </button>

                <button
                  class="feedback-btn-outline"
                  data-dismiss="modal"
                  aria-hidden="true"
                  @click="hideFeedbackModal"
                >
                  Cancel
                </button>
              </div>
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

// Watch for changes in props.myProp
watch(() => store.showFeedbackModal, (newValue, oldValue) => {
  feedbackModalShow.value = newValue; // Update the value in the ref if needed
});

const { Errors, resetForm, handleSubmit } = useForm();
const feedbackModalShow = ref(store.showFeedbackModal);
const feedbackValues = ref({});
const feedbackLoading = ref(false);
const feedbackMsg = ref(false);
const allErrorsFeedback = ref({});


const hideFeedbackModal = () => {
  feedbackModalShow.value = false;
  feedbackValues.value = {};
  allErrorsFeedback.value = {};
  emits("closeModal");
};

const submitFeedback = handleSubmit(async () => {
  try {
    feedbackLoading.value = true;
    let formValues = feedbackValues.value;
    await validationSchemaFeedBack.validate(feedbackValues.value, {
      abortEarly: false,
    });
    const formData = new FormData();
    formData.append("type", "inquiry");
    formData.append("title", "this is home page contact mail");
    formData.append("email", formValues.email);
    formData.append("phone", formValues.phone);
    formData.append("name", formValues.name);
    formData.append("message", formValues.message);
    const response = await WordpressService.FeedBack.submitFeedback(formData);
    if (response.status === 200 && response.data.success) {
      allErrorsFeedback.value = {};
      feedbackValues.value = {};
      feedbackMsg.value = true;
      setTimeout(() => {
        feedbackMsg.value = false;
        hideFeedbackModal();
      }, 5000);
    }
  } catch (validationErrors) {
    const errors = validationErrors.inner.reduce((acc, error) => {
      acc[error.path] = error.message;
      return acc;
    }, {});

    allErrorsFeedback.value = errors;
  }
  feedbackLoading.value = false;
});

const validationSchemaFeedBack = yup.object({
  message: yup.string().required("Message is a required field"),
  name: yup.string().required("Name is a required field"),
  email: yup
    .string()
    .email("Invalid email format")
    .matches(
      /^[^+]+@[^+]+\.[^+]+$/,
      "Email address cannot contain the '+' character."
    )
    .required("Email is a required field"),
  phone: yup
    .string()
    .required("Phone Number is a required field")
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number"),
});
</script>