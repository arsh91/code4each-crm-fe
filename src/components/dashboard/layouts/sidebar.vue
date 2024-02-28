<template>
  <div class="d-flex align-items-stretch">
    <div
      class="sidebar py-3"
      :class="{ 'shrink show': store.menuShrink }"
      id="sidebar"
    >
      <div
        class="show-currentwesbite"
        data-toggle="modal"
        data-target="#myModal"
        v-if="currentRoute != '/dashboard'"
      >
        <div class="card">
          <div class="card-show">
            <div
              class="website-show"
              data-toggle="modal"
              data-target="#myModal"
            >
              <h3 class="boxed">
                {{
                  siteSettingsDeatil?.agency_website_detail?.business_name
                    .charAt(0)
                    .toUpperCase()
                }}
              </h3>
              <a
                class="website-links"
                data-toggle="modal"
                data-target="#myModal"
              >
                <h5 class="text-center">
                  {{ siteSettingsDeatil?.website_domain }}
                </h5>
              </a>
            </div>
          </div>
        </div>
      </div>
      <ul class="list-unstyled">
        <li class="sidebar-list-item">
          <router-link
            :to="{ name: 'dashboard' }"
            class="sidebar-link text-muted"
            :class="{ active: currentRoute === '/dashboard' }"
          >
            <i class="fa fa-home me-3"></i>
            <span class="sidebar-link-title"> Dashboard</span>
          </router-link>
        </li>
        <li
          class="sidebar-list-item"
          v-if="
            dashboardData?.agency_website_info?.length >= 1 &&
            dashboardData?.agency_website_info[0].website_id
          "
        >
          <a
            class="sidebar-link text-muted"
            :class="{ active: currentRoute.includes('/customize') }"
            data-bs-target="#cmsDropdown"
            role="button"
            aria-expanded="false"
            data-bs-toggle="collapse"
          >
            <i class="fa fa-cogs me-3"></i>
            <span class="sidebar-link-title">Customize </span>
          </a>
          <ul
            class="sidebar-menu list-unstyled collapse"
            :class="{ show: currentRoute.includes('/customize') }"
            v-if="dashboardData?.agency_website_info?.length >= 1"
            id="cmsDropdown"
          >
            <li
              class="sidebar-list-item"
              :class="{ active: currentRoute === '/customize/components' }"
            >
              <router-link
                :to="{ name: 'customize_components' }"
                class="sidebar-link text-muted"
                :class="{
                  active: currentRoute.includes('/customize/components'),
                }"
              >
                <i class="fa fa-book"></i>
                <span class="sidebar-link-title"> Components</span>
              </router-link>
            </li>
            <li class="sidebar-list-item">
              <router-link
                :to="{ name: 'customize_colors' }"
                class="sidebar-link text-muted"
                :class="{
                  active: currentRoute.includes('/customize/colors'),
                }"
              >
                <i class="fa fa-paint-brush" aria-hidden="true"></i
                ><span class="sidebar-link-title">Colors</span>
              </router-link>
            </li>
            <li class="sidebar-list-item">
              <router-link
                :to="{ name: 'customize_fonts' }"
                class="sidebar-link text-muted"
                :class="{
                  active: currentRoute.includes('/customize/fonts'),
                }"
              >
                <i class="fa fa-font" aria-hidden="true"></i>
                <span class="sidebar-link-title">Fonts</span>
              </router-link>
            </li>
            <li class="sidebar-list-item">
              <router-link
                :to="{ name: 'customize_social_links' }"
                class="sidebar-link text-muted"
                :class="{
                  active: currentRoute.includes('/customize/social-links'),
                }"
              >
                <i class="fa fa-bookmark"></i>
                <span class="sidebar-link-title">Social Links</span>
              </router-link>
            </li>
            <li class="sidebar-list-item">
              <router-link
                :to="{ name: 'menusPage' }"
                class="sidebar-link text-muted"
                :class="{
                  active: currentRoute.includes('/customize/menus'),
                }"
              >
                <i class="fa fa-list-ul" aria-hidden="true"></i>
                <span class="sidebar-link-title">Site Menus</span>
              </router-link>
            </li>
            <li class="sidebar-list-item">
              <router-link
                :to="{ name: 'rearrangePage' }"
                class="sidebar-link text-muted"
                :class="{
                  active: currentRoute.includes('/customize/rearrange'),
                }"
              >
                <i class="fa fa-arrows"></i>
                <span class="sidebar-link-title">Rearrange</span>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
      <div class="dashboard-design" v-if="currentRoute === '/dashboard'">
        <div class="feedback-btn">
          <button type="submit" class="feedback-button" @click="showModal">
            Help?
          </button>
        </div>
      </div>
      <div class="Regenerate" v-else>
        <form class="text-start mb-2 mt-3">
          <div class="form-field mb-4">
            <button class="btn btn-outline-danger btn-danger " type="button" id="button-addon3" data-toggle="modal" data-target="#myform"><i class="fa fa-retweet" aria-hidden="true"></i><span> Regenerate</span></button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <ChangeWebsiteModal
    :allSitesData="dashboardData?.agency_website_info"
    :activeSite="siteSettingsDeatil?.agency_website_detail?.website_id"
  />

  <div
    class="modal feedback-model fade"
    id="modalContactForm"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
    :class="{ show: feedbackModalShow, 'd-block': feedbackModalShow }"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header" style="border: 0">
          <button
            type="button"
            class="btn-close"
            @click="hideModal"
            aria-hidden="true"
          ></button>
        </div>
        <div class="modal-body mx-3">
          <div class="card-layout layout-medium">
            <div class="content">
              <div class="close-button"></div>

              <h1 class="title">Give feedback / Inquiry</h1>
              <label data-error="wrong" data-success="right" for="form34"
                >Title*</label
              >
              <input
                type="text"
                class="form-control"
                id="field1"
                placeholder="Title"
                v-model="values.title"
              />
              <div class="text-danger">{{ allErrors.title }}</div>

              <label data-error="wrong" data-success="right" for="form34"
                >Type*</label
              >
              <select
                class="form-select1"
                id="field1"
                aria-label="Select an option"
                v-model="values.type"
              >
                <option value="">Select Type</option>
                <option value="review">Review</option>
                <option value="complaint">Complaint</option>
                <option value="feedback">Feedback</option>
                <option value="suggestion">Suggestion</option>
                <option value="inquiry">Inquiry</option>
              </select>
              <div class="text-danger">{{ allErrors.type }}</div>
              <label data-error="wrong" data-success="right" for="form34"
                >Message*</label
              >
              <textarea
                class="form-control input"
                placeholder="Write Your Message.."
                rows="5"
                v-model="values.message"
              ></textarea>
              <div class="text-danger">{{ allErrors.message }}</div>

              <div class="user-actions">
                <div v-if="feedBackloading" class="three-body3">
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                </div>
                <button class="feedback-btn-primary" @click="submitFeedback">
                  Send
                </button>

                <button class="feedback-btn-outline" @click="hideModal">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="ModalShowing" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, watch, defineProps, onMounted, computed } from "vue";
import SelectBox from "@/components/common/SelectBox.vue";
import ChangeWebsiteModal from "@/components/dashboard/elements/ChangeWebsiteModal.vue";
import { useStore } from "@/stores/store";
import { boolean } from "yup";
import WordpressService from "@/service/WordpressService";
import { useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  dashboardData: Object,
  toggled: Boolean,
});
const allErrors = ref({});
const values = ref({});
const feedBackloading = ref(false);
const feedbackModalShow = ref(false);
const ModalShowing = ref(false);
const route = useRoute();
const router = useRouter();
const currentRoute = ref(route.path);
const dashboardData = ref([]);
const isActive = (routePath) => route.path === routePath;
const store = useStore();
const selectedValue = ref();
const compoentUl = ref(false);
const siteSettingsDeatil = ref([]);
const { errors, resetForm, handleSubmit } = useForm();

const handleSelectChange = (selectedValue) => {
  store.updateWebsiteId(selectedValue);
};

watch(
  () => route.path,
  (newFullPath, oldcurrentRouteFullPath) => {
    currentRoute.value = route.path;
  }
);

watch(
  () => props.dashboardData,
  (newFullPath, oldcurrentRouteFullPath) => {
    dashboardData.value = props.dashboardData;
  }
);

onMounted(async () => {
  dashboardData.value = props.dashboardData;
  store.fetchInitialWebsiteId();
  selectedValue.value = store.websiteId;
  await getSiteDeatils();
});

const websiteOptions = computed(() =>
  props.dashboardData?.agency_website_info.map((website_info) => ({
    label: website_info.business_name,
    value: website_info.website_id,
  }))
);

watch(
  () => store.websiteId,
  async (newFullPath, oldcurrentRouteFullPath) => {
    selectedValue.value = store.websiteId;
    await getSiteDeatils();
  }
);

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

const showModal = () => {
  feedbackModalShow.value = true;
  ModalShowing.value = true;
  values.value.type = "";
};

const hideModal = () => {
  feedbackModalShow.value = false;
  ModalShowing.value = false;
  allErrors.value = {};
  values.value = {};
};

const validationSchema = yup.object({
  title: yup.string().required("Title is a required field"),
  type: yup.string().required("Type is a required field"),
  message: yup.string().required("Message is a required field"),
});

const submitFeedback = handleSubmit(async () => {
  try {
    feedBackloading.value = true;
    let formValues = values.value;
    await validationSchema.validate(values.value, { abortEarly: false });
    const formData = new FormData();
    formData.append("type", formValues.type);
    formData.append("title", formValues.title);
    formData.append("agency_id", dashboardData.value?.user?.agency_id);
    formData.append("email", dashboardData.value?.user?.email);
    formData.append("name", dashboardData.value?.user?.name);
    formData.append(
      "phone",
      dashboardData.value.user.phone ? dashboardData.value.user.phone : ""
    );
    formData.append("message", formValues.message);
    const response = await WordpressService.FeedBack.submitFeedback(formData);
    if (response.status === 200 && response.data.success) {
      hideModal();
      console.log("sidebar.vue");
      store.updateFlashMeassge(true, "Feedback shared sucessfully");
    }
  } catch (validationErrors) {
    const errors = validationErrors.inner.reduce((acc, error) => {
      acc[error.path] = error.message;
      return acc;
    }, {});

    allErrors.value = errors;
  }
  feedBackloading.value = false;
});
</script>

