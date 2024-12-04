<script setup>
import NavBar from "@/components/dashboard/layouts/navbar.vue";
import SideBar from "@/components/dashboard/layouts/sidebar.vue";
import { useAuth } from "@/service/useAuth";
import { useRouter } from "vue-router";
import { ref, defineProps, onMounted, provide, inject, watch } from "vue";
import WordpressService from "@/service/WordpressService";
import Modal from "@/components/common/Modal.vue";
import Swal from "sweetalert2";
import EditSiteSettingsFormBuilder from "@/components/common/EditSiteSettingsFormBuilder.vue";
import EditSiteSettingsButtonFormBuilder from "@/components/common/EditSiteSettingsButtonFormBuilder.vue";
import { useStore } from "@/stores/store";
import { capitalizeAndReplaceChar } from "@/util/helper";
import { VueDraggableNext } from "vue-draggable-next";
import config from "/config";
import { openLinkInNewTab } from "@/util/helper";
import { EventBus } from "@/EventBus";
import DeleteModal from "@/components/common/DeleteModal.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import ProcessCompleteModal from "@/components/common/ProcessCompleteModal.vue";
import AnimationLoader from "@/components/common/AnimationLoader.vue";
import Loader from "@/components/common/Loader.vue";

const router = useRouter();
const { logout } = useAuth();
const isSidebarToggled = ref(true);
const activeComponentsDetail = ref([]);
const allComponentsDetailAccToType = ref();
const selectedImage = ref();
const store = useStore();
const oldComponentType = ref();
const navBarToggle = (value) => {
  isSidebarToggled.value = value;
};
const storeComponentsPosition = ref([]);
const buttonStates = ref();
const loading = ref(true);
const error = ref(false);
const errors = ref([]);
const dashboardData = ref([]);
const userData = ref([]);
const showModal = ref(false);
const loadingForComonents = ref(true);
const oldComponent = ref();
const newComponent = ref();
const showEditComponentFieldModal = ref(false);
const siteSettingsFormFields = ref([]);
const siteSettingsDeatil = ref();
const componentsFieldsUnderEdit = ref({
  id: null,
  type: null,
});
const saveComponentPositionBtn = ref(false);
const enabled = ref(true);
const disableDragDrop = ref(true);
const itemDraggingStates = ref({});
const showEditMupltipleImagesModal = ref(false);
const uploadedFiles = ref([]);
const disableImageSubmitButton = ref();
const fileInput = ref(null);
const componentImagesAcctoType = ref();
const selectedComponentPreviewImgSrc = ref();
const btnDisable = ref(false);
const currentTab = ref("image");
const selectedDeletedImageUrl = ref(null);
const newActiveColorId = ref(null);

const defaultColors = ref();

const fetchDashboardData = async () => {
  try {
    const response = await WordpressService.fetchDashboardData();
    if (response.status === 200 && response.data.success) {
      // loading.value = false;
      dashboardData.value = response.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Authentication failed. Please log in.", error);
      error.value = true;
      // loading.value = false;
      localStorage.removeItem("access_token");
      router.push("/login");
    } else {
      console.error("An error occurred:", error.message);
    }
  }
};

const getActiveComponentsData = async () => {
  try {
    const response = await WordpressService.Components.getActiveComponents({
      website_url: siteSettingsDeatil.value?.website_domain,
    });

    if (response.status === 200 && response.data.success) {
      activeComponentsDetail.value = response.data.components_detail;
      let firstActiveComponent = activeComponentsDetail.value[0];
      activeComponentsDetail.value.forEach((image) => {
        activeComponentsDetail.dragging = false;
      });
      buttonStates.value = new Array(activeComponentsDetail.value.length).fill(
        false
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const changeDefaultColors = async () => {
  if (!newActiveColorId.value) {
    return;
  }
  try {
    btnDisable.value = true;
    const response = await WordpressService.CustomizeColors.changeDefaulColors({
      website_url: siteSettingsDeatil.value?.website_domain,
      color_id: newActiveColorId.value,
    });

    if (response.status === 200) {
      await getDefaultColors();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  btnDisable.value = false;
};

onMounted(async () => {
  await getSiteDeatils();
  await fetchDashboardData();
  await getActiveComponentsData();
  await getDefaultColors();
  loading.value = false;
});

watch(
  () => store.websiteId,
  async (newWebsiteId, oldWebsiteId) => {
    await getSiteDeatils();
    await fetchDashboardData();
    await getActiveComponentsData();
    await getDefaultColors();
    loading.value = false;
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

const regenerateWebsite = async () => {
  try {
    loading.value = true;
    const response = await WordpressService.regenerateWebsite({
      agency_id: dashboardData.value.user.agency_id,
      website_url: siteSettingsDeatil.value.website_domain,
    });
    await getSiteDeatils();
    await fetchDashboardData();
    await getActiveComponentsData();
  } catch (error) {
    console.log(error);
    console.error("Error Occur while regenerating website", error);
  }
  loading.value = false;
};
const getDefaultColors = async () => {
  try {
    const response = await WordpressService.CustomizeColors.getDefaulColors({
      website_url: siteSettingsDeatil.value?.website_domain,
    });
    if (response.status === 200 && response.data) {
      defaultColors.value = response.data;
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const activateColorSet = (id, setIndex) => {
  newActiveColorId.value = id;
  defaultColors.value.forEach((colorSet) => {
    colorSet.active = false;
  });
  defaultColors.value[setIndex].active = true;
};
</script>

<template>
  <div class="page">
    <NavBar
      @logout="logout"
      @nav-bar-toggle="navBarToggle"
      :dashboardData="dashboardData?.user"
    ></NavBar>
    <SideBar
      :dashboardData="dashboardData"
      :toggled="isSidebarToggled"
    ></SideBar>
    <section id="content-wrapper main-content side-content">
      <div class="side-app">
        <div class="main-container-components container">
          <div id="wrapper">
            <div
              class="eidtor-site"
              aria-hidden="true"
              data-toggle="modal"
              data-target="#exampleModalRight-components"
            >
              <div
                v-for="(compValue, index) in activeComponentsDetail"
                :key="index"
              >
                <div
                  class="eidtor-img"
                  @click="
                    openModal(compValue.type, compValue.id, compValue.preview)
                  "
                >
                  <img :src="config.CRM_API_URL + compValue.preview" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="right-side">
      <div class="sidebar-right py-3" id="sidebar-right">
        <header
          data-hook="panel-header"
          class="panel-header panel-header-flex theme-standard without-stripe"
        >
          <div class="panel-header-title">
            <span class="panel-header-title-span"> </span>
            <img
              src="/images/export.png"
              @click="openLinkInNewTab(siteSettingsDeatil.website_domain)"
              style="cursor: pointer"
            />
          </div>
        </header>
        <hr />
        <div class="ifYqM">
          <div
            class="eidtor-sitecolor"
            aria-hidden="true"
            data-toggle="modal"
            data-target="#exampleModalRight-components"
          >
            <h2>Which colors do you like ?</h2>
            <p class="text-center">
              Choose the color combination that best matches your style. You can
              always change it later on.
            </p>

            <div class="eyP3_">
              <i class="fa fa-paint-brush" aria-hidden="true"></i>
              <h5>Recommended</h5>
            </div>

            <div v-for="(colorSet, setIndex) in defaultColors" :key="setIndex">
              <ul
                class="J4bYN"
                data-gi-selector="palettes-list"
                @click="activateColorSet(colorSet.id, setIndex)"
              >
                <li class="TihVb GLbmx" :class="{ active: colorSet.active }">
                  <i
                    class="fa fa-check"
                    v-if="colorSet.active"
                    aria-hidden="true"
                  ></i>

                  <span
                    v-for="(color, colorIndex) in colorSet.colors"
                    :key="colorIndex"
                    class="EvlyK"
                    :style="{ backgroundColor: color }"
                  >
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div class="button-wrapper">
            <button
              type="submit"
              class="preview-btn"
              @click="changeDefaultColors()"
              :disabled="btnDisable"
            >
              <i class="fa fa-upload" aria-hidden="true"></i> Publish
            </button>
            <div class="three-bodyc" v-if="btnDisable">
                        <div class="three-body__dot"></div>
                        <div class="three-body__dot"></div>
                        <div class="three-body__dot"></div>
                </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Loader v-if="loading" />
  <DeleteModal @confirm="deleteComponentImage" />
  <ConfirmModal
    modalTitle="Confirm!"
    modalText="Do you really want to regenrate This will regenrate your site"
    @confirm="regenerateWebsite"
    confirmText="Submit"
  />
  <ProcessCompleteModal
    modalTitle="Awesome!"
    modalText="Your website Regenerated successfully"
    confirmText="Preview"
    @confirm="openLinkInNewTab(siteSettingsDeatil.website_domain)"
  />
</template>

