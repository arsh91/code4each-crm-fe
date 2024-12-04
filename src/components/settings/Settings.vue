<script setup>
import NavBar from "@/components/dashboard/layouts/navbar.vue";
import SideBar from "@/components/dashboard/layouts/sidebar.vue";
import { useAuth } from "@/service/useAuth";
import { useRouter } from "vue-router";
import {
  ref,
  defineProps,
  onMounted,
  provide,
  inject,
  computed,
  watch,
} from "vue";
import WordpressService from "@/service/WordpressService";
import Modal from "@/components/common/Modal.vue";
import Swal from "sweetalert2";
import VeeInput from "@/components/common/VeeInput.vue";
import { useForm } from "vee-validate";
import { EventBus } from "@/EventBus";
import SelectBox from "@/components/common/SelectBox.vue";
import * as yup from "yup";
import { useStore } from "@/stores/store";
import config from "/config";
import { copyTextToClipboard, openLinkInNewTab } from "@/util/helper";
import AnimationLoader from "@/components/common/AnimationLoader.vue";

const router = useRouter();
const { logout } = useAuth();
const isSidebarToggled = ref(false);
const siteSettingsDeatil = ref([]);
const allComponentsDetailAccToType = ref();
const selectedImage = ref();
const categories = ref();
const store = useStore();
const errorMessage = ref("");
const message = ref("");
const isCopied = ref(false);
const navBarToggle = (value) => {
  isSidebarToggled.value = value;
};

const loading = ref(true);
const error = ref(false);
const errors = ref([]);
const dashboardData = ref([]);
const userData = ref([]);
const showModal = ref(false);
const loadingForSettings = ref(true);
const isDisabled = ref(false);
const formData = ref({});
const allErrors = ref({});
const { Errors, resetForm, handleSubmit } = useForm();
const showOthersCategoryName = ref(false);

watch(
  () => store.websiteId,
  async (newWebsiteId, oldWebsiteId) => {
    loadingForSettings.value = true;
    await getSiteDeatils();
    await openModalWithCategories();
    loadingForSettings.value = false;
  }
);

const fetchDashboardData = async () => {
  try {
    const response = await WordpressService.fetchDashboardData();
    if (response.status === 200 && response.data.success) {
      loading.value = false;
      dashboardData.value = response.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Authentication failed. Please log in.", error);
      error.value = true;
      loading.value = false;
      localStorage.removeItem("access_token");
      router.push("/login");
    } else {
      console.error("An error occurred:", error.message);
    }
  }
};

const getSiteDeatils = async () => {
  try {
    const response = await WordpressService.WebsiteSettings.getSiteDetail({
      website_id: store.websiteId,
    });
    if (response.status === 200 && response.data.success) {
      siteSettingsDeatil.value = response.data.settings_detail;
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const openModalWithCategories = async () => {
  try {
    const response = await WordpressService.getCategoryOption();
    if (response.status === 200 && response.data.success) {
      categories.value = response.data.categories.map((category) => ({
        label: category.name,
        value: category.id,
      }));
    }
  } catch (error) {
    console.error(error);
  }
};

const openModal = async (compType, oldComponentUniqueeId) => {
  try {
    const response = await WordpressService.Components.getAllComponents({
      type: compType,
    });
    if (response.status === 200 && response.data.success) {
      allComponentsDetailAccToType.value = response.data.component;
      oldComponent.value = oldComponentUniqueeId;
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  showModal.value = true;
};

onMounted(async () => {
  allErrors.value = {};
  await getSiteDeatils();
  await openModalWithCategories();
  setFormValues();
  loadingForSettings.value = false;
});

const validationSchema = yup.object({
  address: yup.string().required("Address is a required field"),
  category_id: yup.string().required("Category is a required field"),
  website_id: yup.string().required(),
  business_name: yup.string().required("Business name is a required field"),
  state: yup.string().required("State is a required field"),
  country: yup.string().required("Country is a required field"),
  city: yup.string().required("City is a required field"),
  zip: yup.string().required("Zip Code is a required field"),
  phone: yup
    .string()
    .required("Phone Number is a required field")
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number"),

  logo: yup.mixed().test("fileType", "Unsupported file format", (value) => {
    if (!value) {
      return true;
    }

    const supportedFormats = ["image/jpeg", "image/png", "image/gif"];
    return value && supportedFormats.includes(value.type);
  }),
});

const updateWebsiteSettings = handleSubmit(async () => {
  try {
    isDisabled.value = true;
    await validationSchema.validate(formData.value, { abortEarly: false });
    allErrors.value = {};
    const customHeaders = {
      "Content-Type": "multipart/form-data",
    };

    const response = await WordpressService.WebsiteSettings.updateSiteSettings(
      formData.value,
      customHeaders
    );
    if (response.status === 200 && response.data.success) {
      await fetchDashboardData();
      await getSiteDeatils();
      await openModalWithCategories();
      resetForm();
      store.updateFlashMeassge(true, "Site settings update sucessfully");
    }
  } catch (validationErrors) {
    const errors = validationErrors.inner.reduce((acc, error) => {
      acc[error.path] = error.message;
      return acc;
    }, {});

    allErrors.value = errors;
  }
  isDisabled.value = false;
});

const clearFormValues = (values) => {
  values.category_id = "";
  values.description = "";
  values.address = "";
};

const categoryOptions = computed(() =>
  categories?.value?.map((category) => ({
    label: category.name,
    value: category.id,
  }))
);

const setFormValues = () => {
  formData.value = {};
  formData.value.logo = "";
  const agencyWebsiteDetail = siteSettingsDeatil?.value?.agency_website_detail;
  formData.value.category_id = agencyWebsiteDetail?.website_category_id || "";
  formData.value.business_name = agencyWebsiteDetail?.business_name || "";
  formData.value.address = agencyWebsiteDetail?.address || "";
  formData.value.description =
    agencyWebsiteDetail?.description !== "undefined"
      ? agencyWebsiteDetail?.description
      : "";
  formData.value.country = agencyWebsiteDetail?.country || "";
  formData.value.city = agencyWebsiteDetail?.city || "";
  formData.value.zip = agencyWebsiteDetail?.zip || "";
  formData.value.phone = agencyWebsiteDetail?.phone || "";
  formData.value.state = agencyWebsiteDetail?.state || "";
  formData.value.website_id = agencyWebsiteDetail?.website_id;
  formData.value.others_category_name =
    agencyWebsiteDetail?.others_category_name;
  if (agencyWebsiteDetail?.others_category_name) {
    showOthersCategoryName.value = true;
  }
};

const handleCopyClick = (text) => {
  copyTextToClipboard(text);
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 1000);
};

watch(
  () => siteSettingsDeatil,
  (newsiteSettingsDeatil, OldsiteSettingsDeatil) => {
    setFormValues();
  },
  {
    deep: true,
  }
);

const onFileChange = (event) => {
  formData.value.logo = event.target.files[0];
};

const goToCutomize = () => {
  router.push("/customize");
};

const oncategoryChange = (event) => {
  const selectedOption = event.target.selectedOptions[0];
  if (selectedOption && selectedOption.label === "Others") {
    showOthersCategoryName.value = true;
  } else {
    showOthersCategoryName.value = false;
    formData.value.others_category_name = "";
  }
};
</script>

<template>
  <div
    class="modal fade drawer right-align"
    id="exampleModalRight"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    v-if="siteSettingsDeatil?.agency_website_detail"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <img
            v-if="siteSettingsDeatil?.agency_website_detail?.logo"
            :src="
              config.CRM_API_URL + siteSettingsDeatil.agency_website_detail.logo
            "
          />
          <span v-else>{{
            siteSettingsDeatil?.agency_website_detail?.business_name
          }}</span>

          <button
            type="button"
            class="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="box-2">
            <div class="box-inner-2">
              <form class="text-start mb-2 mt-3">
                <label for="basic-url" class="form-label">Website URL</label>
                <div class="form-field mb-4">
                  <div class="input-group mb-3">
                    <a
                      href="#"
                      @click="
                        openLinkInNewTab(siteSettingsDeatil.website_domain)
                      "
                      class="website-links"
                    >
                      {{ siteSettingsDeatil.website_domain }}
                    </a>
                  </div>

                  <button
                    class="btn btn-outline-success btn-success linkBtn"
                    type="button"
                    id="button-addon2"
                    @click="openLinkInNewTab(siteSettingsDeatil.website_domain)"
                  >
                    <i class="fa fa-share-square"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger btn-danger text-light linkBtn"
                    type="button"
                    id="button-addon3"
                    @click="handleCopyClick(siteSettingsDeatil.website_domain)"
                  >
                    <i
                      class="fa fa-copy"
                      data-toggle="tooltip"
                      data-placement="top"
                      title="copy"
                    ></i>
                  </button>
                  <div v-if="isCopied" class="success-message">Copied!</div>
                </div>
              </form>
            </div>
          </div>
          <section class="Settings-form">
            <div class="form-wrapper">
              <h2>Your website settings</h2>
              <div class="row">
                <div class="col-sm-6 form-group">
                  <label for="category_id" class="form-label"
                    >Website Category*</label
                  >
                  <select
                    class="form-select"
                    aria-label="Select an option"
                    v-model="formData.category_id"
                    id="category_id"
                    @change="oncategoryChange"
                  >
                    <option value="" selected>Select Category</option>
                    {{
                      categories
                    }}
                    <option
                      v-for="option in categories"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <div id="other-div" v-if="showOthersCategoryName">
                    <label for="" class="form-label">About Category</label>
                    <input
                      class="form-control input"
                      placeholder="Write About Category You Want.."
                      rows="2"
                      v-model="formData.others_category_name"
                    />
                  </div>
                  <div class="text-danger">{{ allErrors.category_id }}</div>
                </div>
                <div class="col-sm-6 form-group">
                  <label for="business_name" class="form-label"
                    >Business Name*</label
                  >
                  <input
                    type="text"
                    placeholder="Business Name"
                    class="form-control input"
                    v-model="formData.business_name"
                    id="business_name"
                  />
                  <div class="text-danger">{{ allErrors.business_name }}</div>
                </div>
                <div class="col-sm-6 form-group">
                  <label for="address" class="form-label">Address*</label>
                  <input
                    type="text"
                    placeholder="Address"
                    class="form-control input"
                    v-model="formData.address"
                    id="address"
                  />
                  <div class="text-danger">{{ allErrors.address }}</div>
                </div>
                <div class="col-sm-6 form-group">
                  <label for="city" class="form-label">City*</label>
                  <input
                    type="text"
                    placeholder="City"
                    class="form-control input"
                    v-model="formData.city"
                    id="city"
                  />
                  <div class="text-danger">{{ allErrors.city }}</div>
                </div>
                <div class="col-sm-6 form-group">
                  <label for="city" class="form-label">State*</label>
                  <input
                    type="text"
                    placeholder="State"
                    class="form-control input"
                    v-model="formData.state"
                    id="State"
                  />
                  <div class="text-danger">{{ allErrors.state }}</div>
                </div>
                <div class="col-sm-6 form-group">
                  <label for="zip" class="form-label">Zip Code*</label>
                  <input
                    type="text"
                    placeholder="Zip Code"
                    class="form-control input"
                    v-model="formData.zip"
                    id="zip"
                  />
                  <div class="text-danger">{{ allErrors.zip }}</div>
                </div>
                <div class="col-sm-6 form-group">
                  <label for="country" class="form-label">Country*</label>
                  <select
                    class="form-select"
                    id="country"
                    aria-label="Select an option"
                    v-model="formData.country"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Europe">Europe</option>
                    <option value="England">England</option>
                  </select>
                  <div class="text-danger">{{ allErrors.country }}</div>
                </div>
                <div class="col-sm-6 form-group">
                  <label for="logo" class="form-label">Website Logo</label>
                  <input
                    type="file"
                    name="logo"
                    class="form-control input"
                    accept=".jpg, .jpeg, .png"
                    @change="onFileChange"
                    id="logo"
                  />

                  <div class="text-danger">{{ allErrors.logo }}</div>
                </div>

                <div class="col-sm-6 form-group">
                  <label for="zip" class="form-label">Phone*</label>
                  <input
                    type="text"
                    placeholder="Phone"
                    class="form-control input"
                    v-model="formData.phone"
                    id="phone"
                  />
                  <div class="text-danger">{{ allErrors.phone }}</div>
                </div>
                <div class="col-sm-12 form-group mb-5">
                  <label for="" class="form-label">Description</label>
                  <textarea
                    class="form-control input"
                    placeholder="Description..(optional)"
                    rows="3"
                    v-model="formData.description"
                  ></textarea>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="modal-footer">
          <div class="button-wrap">
            <button
              class="custom-button-fill"
              @click="goToCutomize"
              data-dismiss="modal"
            >
              <span class="button-text">Customize</span>
            </button>

            <button
              class="custom-button"
              @click="updateWebsiteSettings"
              :disabled="isDisabled"
            >
              <span class="button-fill-text">Submit</span>
            </button>
            <div v-if="isDisabled" class="three-body3">
              <div class="three-body__dot1"></div>
              <div class="three-body__dot1"></div>
              <div class="three-body__dot1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

