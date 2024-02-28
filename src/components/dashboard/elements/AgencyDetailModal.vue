<script setup>
import { ref, computed, defineEmits, onMounted, inject, watch } from "vue";
import SelectBox from "@/components/common/SelectBox.vue";
import Modal from "@/components/common/Modal.vue";
import VeeInput from "@/components/common/VeeInput.vue";
import WordpressService from "@/service/WordpressService";
import { useForm } from "vee-validate";
import { EventBus } from "@/EventBus";
import * as yup from "yup";
import "@/assets/js/dashboard.js";
import { openLinkInNewTab } from "@/util/helper";

const dashBoardMethods = inject("dashBoardMethods");
const loading = ref("");
const errorMessage = ref("");
const message = ref("");
const countdown = ref(5);
const files = ref([]);
const currentStep = ref(1);
const allDashboardData = ref();
const animatedSvg = ref(null);
const startTime = ref(null);
const timeSpent = ref(null);
const values = ref({});
const allErrors = ref({});

const domainUrl = ref(null);
const { errors, resetForm, handleSubmit } = useForm();
const showOthersCategoryName = ref(false);

const props = defineProps({
  showModal: true,
  dashboardData: Object,
  categories: Array,
});

const emits = defineEmits();
const closeModal = () => {
  emits("hide-modal");
};

const categoryOptions = computed(() =>
  props.categories.map((category) => ({
    label: category.name,
    value: category.id,
  }))
);

const validationSchemaFirst = yup.object({
  businessName: yup.string().required("Address is a required field"),
  businessCategory: yup.string().required("Category is a required field"),

  phone: yup
    .string()
    .required("Phone Number is a required field")
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number"),

  logo: yup.mixed().test("fileType", "File should be jpeg/png", (value) => {
    if (!value) {
      return true;
    }

    const supportedFormats = ["image/jpeg", "image/png", "image/gif"];
    return value && supportedFormats.includes(value.type);
  }),
});

const validationSchemaSeconds = yup.object({
  address: yup.string().required("Address is a required field"),
  city: yup.string().required("City is a required field"),
  state: yup.string().required("State is a required field"),
  country: yup.string().required("Country is a required field"),
  zip: yup
    .number()
    .typeError("Zip field must be a valid number")
    .required("Zip is a required field"),
});

const submitAgencyDetailC = handleSubmit(async () => {
  try {
    startTimer();
    currentStep.value = 4;
    let formValues = values.value;
    const formData = new FormData();
    formData.append("logo", formValues.logo);
    formData.append("business_name", formValues.businessName);
    formData.append("agency_id", allDashboardData.value?.user?.agency_id);
    formData.append("category_id", formValues.businessCategory);
    formData.append("address", formValues.address);
    formData.append("city", formValues.city);
    formData.append("state", formValues.state);
    formData.append("country", formValues.country);
    formData.append("zip", formValues.zip);
    formData.append("description", formValues.description);
    formData.append("phone", formValues.phone);
    if (showOthersCategoryName) {
      formData.append("others_category_name", formValues.othersCategoryName);
    }
    const customHeaders = {
      "Content-Type": "multipart/form-data",
    };
    const response = await WordpressService.agencyDetails(
      formData,
      customHeaders
    );
    if (response.status === 200 && response.data.success) {
      message.value = response?.data?.message;
      if (response?.data?.website_domain) {
        domainUrl.value = response?.data?.website_domain;
        getTimeSpent();
        currentStep.value = 5;
      } else {
        currentStep.value = 6;
      }

      EventBus.emit("fetchDashboardData");
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message;
    console.error(error);
  }
  resetForm();
});

const clearFormValues = (values) => {
  values.category_id = "";
  values.description = "";
  values.address = "";
};

const setFormValues = () => {
  values.value.businessName = allDashboardData.value?.user?.agency?.name;
  values.value.phone = allDashboardData.value?.user?.phone;
  values.value.businessCategory = "";
  values.value.country = "India";
};
onMounted(() => {
  allDashboardData.value = props.dashboardData;
  setFormValues();
});

watch(
  () => props.dashboardData,
  (newDashboardData, OldDashboardData) => {
    allDashboardData.value = props.dashboardData;
    setFormValues();
  },
  {
    deep: true,
  }
);

const prevStep = () => {
  currentStep.value--;
};
const nextStep = async (step = false) => {
  try {
    if (step === "first") {
      await validationSchemaFirst.validate(values.value, {
        abortEarly: false,
      });
    } else if (step === "second") {
      await validationSchemaSeconds.validate(values.value, {
        abortEarly: false,
      });
    }
    currentStep.value++;
    allErrors.value = {};
  } catch (error) {
    const errors =
      error.inner && Array.isArray(error.inner)
        ? error.inner.reduce((acc, err) => {
            acc[err.path] = err.message;
            return acc;
          }, {})
        : {};

    allErrors.value = errors;
  }
};


const onFileChange = (event) => {
  values.value.logo = event.target.files[0];
};

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const fileInputRef = ref(null);

const oncategoryChange = (event) => {
  const selectedOption = event.target.selectedOptions[0];
  if (selectedOption && selectedOption.label === "Others") {
    showOthersCategoryName.value = true;
  } else {
    showOthersCategoryName.value = false;
    values.value.othersCategoryName = "";
  }
};

const startTimer = () => {
  startTime.value = Date.now();
};

const getTimeSpent = () => {
  timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000);
};

const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} minutes ${remainingSeconds} seconds`;
};
</script>
<template>
  <div class="modal fade" id="basicModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog" id="create-popup" role="document">
      <div class="modal-content1">
        <div class="modal-header">
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div id="container" class="container">
            <form
              id="multi-step-form"
              @submit.prevent="submitAgencyDetailC"
              enctype="multipart/form-data"
            >
              <div class="step step-1" v-if="currentStep === 1">
                <!-- Step 1 form fields here -->
                <h3>Create a new website</h3>
                <div class="mb-3">
                  <label for="businessName" class="form-label"
                    >Business Name*</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="businessName"
                    name="businessName"
                    v-model="values.businessName"
                    required
                  />
                  <div class="text-danger">{{ allErrors.businessName }}</div>
                  <label for="businessCategory" class="form-label"
                    >Business Category*</label
                  >
                  <select
                    class="form-select select-category"
                    id="businessCategory"
                    aria-label="Select an option"
                    v-model="values.businessCategory"
                    @change="oncategoryChange"
                  >
                    <option value="" selected>Select Category</option>
                    {{
                      categoryOptions
                    }}
                    <option
                      v-for="option in categoryOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <div class="text-danger">
                    {{ allErrors.businessCategory }}
                  </div>

                  <div v-if="showOthersCategoryName">
                    <label for="othersCategoryName" class="form-label"
                      >About Category</label
                    >
                    <input
                      class="form-control input"
                      placeholder="Write About Category You Want.."
                      rows="3"
                      v-model="values.othersCategoryName"
                    />
                  </div>
                  <label for="phone" class="form-label">Phone*</label>
                  <input
                    type="text"
                    class="form-control"
                    id="phone"
                    name="phone"
                    v-model="values.phone"
                  />
                  <div class="text-danger">{{ allErrors.phone }}</div>
                  <label for="formFileLg" class="form-label"
                    >Website Logo</label
                  >
                  <input
                    type="file"
                    name="logo"
                    id="custom-file-upload"
                    class="form-control input form-control-lg"
                    accept=".jpg, .jpeg, .png"
                    @change="onFileChange"
                    ref="fileInputRef"
                  />
                  <i class="fa fa-upload" @click="triggerFileInput"></i>
                  <div v-if="values.logo" class="file-name mt-1">
                    {{ values.logo.name }}
                  </div>
                  <div class="text-danger">{{ allErrors.logo }}</div>
                </div>

                <button
                  type="button"
                  class="btn btn-primary next-step"
                  @click="nextStep('first')"
                >
                  Get started
                </button>
              </div>

              <div class="step step-2" v-if="currentStep === 2">
                <div class="mb-3">
                  <h3>Fill your address detail</h3>
                  <label for="address" class="form-label">Address*</label>
                  <input
                    type="text"
                    class="form-control"
                    id="address"
                    name="address"
                    v-model="values.address"
                  />
                  <div class="text-danger">{{ allErrors.address }}</div>
                  <label for="city" class="form-label">City*</label>
                  <input
                    type="text"
                    class="form-control"
                    id="city"
                    name="city"
                    v-model="values.city"
                  />
                  <div class="text-danger">{{ allErrors.city }}</div>
                  <label for="state" class="form-label">State*</label>
                  <input
                    type="text"
                    class="form-control"
                    id="state"
                    name="state"
                    v-model="values.state"
                  />
                  <div class="text-danger">{{ allErrors.state }}</div>

                  <label for="zip" class="form-label">Zip Code*</label>
                  <input
                    type="text"
                    class="form-control"
                    id="zip"
                    name="zip"
                    v-model="values.zip"
                  />
                  <div class="text-danger">{{ allErrors.zip }}</div>

                  <label for="country" class="form-label">Country*</label>
                  <select
                    class="form-select"
                    id="country"
                    aria-label="Select an option"
                    v-model="values.country"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Europe">Europe</option>
                    <option value="England">England</option>
                  </select>
                  <div class="text-danger">{{ allErrors.country }}</div>
                </div>

                <button
                  type="button"
                  class="btn btn-primary prev-step"
                  @click="prevStep"
                >
                  Previous
                </button>
                <button
                  type="button"
                  class="btn btn-primary next-step"
                  @click="nextStep('second')"
                >
                  Next
                </button>
              </div>
              <div class="step step-3" v-if="currentStep === 3">
                <!-- Step 2 form fields here -->

                <div class="mb-3">
                  <label for="description" class="form-label"
                    >Description (optional)</label
                  >
                  <textarea
                    class="form-control input"
                    placeholder="Description.."
                    rows="3"
                    v-model="values.description"
                  ></textarea>
                </div>

                <button
                  type="button"
                  class="btn btn-primary prev-step"
                  @click="prevStep"
                >
                  Previous
                </button>
                <button type="submit" class="btn btn-primary next-step">
                  Create Site
                </button>
              </div>
              <div
                class="step step-4"
                :class="currentStep != 4 ? 'd-none' : ''"
              >
                <div class="mb-3 next-step">
                  <div class="three-body2">
                    <div class="three-body__dot"></div>
                    <div class="three-body__dot"></div>
                    <div class="three-body__dot"></div>
                  </div>
                </div>
              </div>
              <div class="step step-5" v-if="currentStep === 5">
                <div class="mb-3">
                  <div class="Successfully">
                    <h1>Congratulations!</h1>
                    <p>Your site get ready in {{ timeSpent }} seconds....</p>

                    <div class="face">
                      <div class="eye"></div>
                      <div class="eye right"></div>
                      <div class="mouth happy"></div>
                    </div>
                    <p>
                      Successfully created your Site
                      <a class="wesbite-url">{{ domainUrl }}</a>
                    </p>
                    <div class="buttons-share">
                      <div class="button1">
                        <button
                          v-if="domainUrl"
                          class="go-home"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          @click="openLinkInNewTab(domainUrl)"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="step step-5" v-if="currentStep === 6">
                <!-- Step 2 form fields here -->
                <div class="mb-3">
                  <div class="Successfully">
                    <h1>Thank you !</h1>

                    <div class="success alert"></div>
                    <p>
                      We're currently experiencing a high volume of requests.
                      Your site will be automatically created based on your
                      requirements. Please check back later. Thank you for your
                      patience.
                    </p>

                    <button
                      class="go-home"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* .select-category {
  height: 50px;
  padding: 10px 20px;
  font-size: 14px;
  margin-bottom: 15px;
  border: 1px solid lightgray;
} */
</style>
