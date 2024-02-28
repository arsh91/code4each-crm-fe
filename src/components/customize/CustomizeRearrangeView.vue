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
  watch,
  computed,
} from "vue";
import WordpressService from "@/service/WordpressService";
import Modal from "@/components/common/Modal.vue";
import Swal from "sweetalert2";
import EditSiteSettingsFormBuilder from "@/components/common/EditSiteSettingsFormBuilder.vue";
import EditSiteSettingsButtonFormBuilder from "@/components/common/EditSiteSettingsButtonFormBuilder.vue";
import { useStore } from "@/stores/store";
import { capitalizeAndReplaceChar } from "@/util/helper";
import config from "/config";
import { openLinkInNewTab } from "@/util/helper";
import { EventBus } from "@/EventBus";
import DeleteModal from "@/components/common/DeleteModal.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import ConfirmUiModal from "@/components/common/ConfirmUiModal.vue";
import ProcessCompleteModal from "@/components/common/ProcessCompleteModal.vue";
import AnimationLoader from "@/components/common/AnimationLoader.vue";
import Loader from "@/components/common/Loader.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useForm } from "vee-validate";
import * as yup from "yup";
import FlashMessage from "@/components/common/FlashMessage.vue";

const router = useRouter();
const { logout } = useAuth();
const isSidebarToggled = ref(true);
const activeComponentsDetail = ref([]);
const activeComponentsDetailShow = ref([]);
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
const loadingForComonents = ref(false);
const oldComponent = ref();
const newComponent = ref();
const showEditComponentFieldModal = ref(false);
const siteSettingsFormFields = ref([]);
const siteSettingsDeatil = ref();
const menuUnderDelete = ref(null);
const saveComponentPositionBtn = ref(false);
const enabled = ref(true);
const itemDraggingStates = ref({});

const onEndComponentPosition = (evt) => {
  saveComponentPositionBtn.value = true;

};

const onStartComponentPosition = (evt) => {
  saveComponentPositionBtn.value = false;
};

const saveComponentPosition = async () => {
  try {
    loadingForComonents.value = true;
    saveComponentPositionBtn.value = false;
    const response = await WordpressService.Components.changeComponentPosition({
      updated_positions: storeComponentsPosition.value,
      website_url: siteSettingsDeatil.value?.website_domain,
    });
    if (response.status === 200 && response.data.success) {
      store.updateFlashMeassge(true, "Position Saved Sucessfully");
      getActiveComponentsData();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  loadingForComonents.value = false;
};

const updateItemPositions = () => {
  storeComponentsPosition.value = activeComponentsDetail.value.map(
    (compo, index) => ({
      component_unique_id: compo.id,
      position: index + 1,
    })
  );
};

watch(() => activeComponentsDetail.value, updateItemPositions, { deep: true });
const fetchDashboardData = async () => {
  try {
    const response = await WordpressService.fetchDashboardData();
    if (response.status === 200 && response.data.success) {
      dashboardData.value = response.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Authentication failed. Please log in.", error);
      error.value = true;
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
      activeComponentsDetailShow.value = response.data.components_detail;
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

onMounted(async () => {
  await getSiteDeatils();
  await fetchDashboardData();
  await getActiveComponentsData();
  loading.value = false;
});

watch(
  () => store.websiteId,
  async (newWebsiteId, oldWebsiteId) => {
    await getSiteDeatils();
    await fetchDashboardData();
    await getActiveComponentsData();

    loading.value = false;
  }
);

provide("dashBoardMethods", {
  fetchDashboardData,
});

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
    await getMenus();
  } catch (error) {
    console.log(error);
    console.error("Error Occur while regenerating website", error);
  }
  loading.value = false;
};
</script>

<template>
  <div class="page">
    <FlashMessage :visible="store.flashMeassge" v-if="store.flashMeassge" />
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
                v-for="(compValue, index) in activeComponentsDetailShow"
                :key="index"
              >
                <div class="eidtor-img">
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
           <h5 class="panel-header-title-span">   Rearrange Components </h5>
            <!--  <img
              src="/images/export.png"
              @click="openLinkInNewTab(siteSettingsDeatil.website_domain)"
              style="cursor: pointer"
            /> -->
         
          </div>
        </header>

        <div class="ifYqM">
            <VueDraggableNext
                  class="dragArea list-group w-full"
                  :list="activeComponentsDetail"
                  @end="onEndComponentPosition"
                  @start="onStartComponentPosition"
                  dragClass="dragItem"
                  ghostClass="dropHere"
                >
                  <div
                    v-for="(compValue, index) in activeComponentsDetail"
                    :key="index"
                    class="image-container"
                  >
                    <img
                      :src="config.CRM_API_URL + compValue.preview"
                      alt="Dynamic"
                      width="250"
                      :class="{
                        dragItem: compValue.dragging,
                      }"
                    />
                  </div>
                </VueDraggableNext>
                  <div class="button-wrapper">
                        <button
                          type="submit"
                          class="preview-btn"
                          v-if="saveComponentPositionBtn"
                          @click="saveComponentPosition"
                          :disabled="loadingForComonents"
                        >
                          <i class="fa fa-upload" aria-hidden="true"></i>
                          Publish
                        </button>
                      <div class="three-bodyc" v-if="loadingForComonents">
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
<style>
.image-container {
  position: relative;
  display: inline-block;
  margin: 10px;
}

.button-container {
  position: absolute;
  bottom: 49px;
  right: 488px;
}

.custom-button:hover {
  background-color: rgba(21, 62, 105, 0.2);
  opacity: 1;
}

.testimonial-container {
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-column-gap: 15px;
}

.testimonial {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  /* width: 300px; */
  margin: 10px 0px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.testimonialImg {
  width: 150px;
  height: 120px;
}
.imageContainer {
  display: inline-block;
  position: relative;
}

.imageContainer::before {
  content: "\2714"; /* Unicode checkmark character */
  position: absolute;
  left: 111%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: green;
}
p {
  font-size: 16px;
  line-height: 1.5;
}
.custom-modal-lg {
  max-width: 50%;
}

.flagWiseImg {
  width: 300px;
  border: 2px solid green;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
}

.disabled-image {
  opacity: 0.5; /* Reduce opacity to make it appear disabled */
  pointer-events: none; /* Disable pointer events to prevent interaction */
}

.image-button-drag {
  top: 50%;
  right: 15%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: block;
}

.dragging {
  opacity: 0.7; /* Reduce opacity while dragging */
  border: 2px solid #3498db; /* Add a border */
  border-radius: 4px; /* Round the corners */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3); /* Add a shadow */
}

.dragItem {
  border: 1px dashed red;
  background: red;
  opacity: 0.5;
}
.dropHere {
  border: 5px dashed red;
}

.dragItem {
  /* width: 250Px; */
 /* Background color */
  border: 2px solid #1d2b64; /* Border style */
  color: #333; /* Text color */
  cursor:#1d2b64; /* Cursor style */
  opacity: 0.7; /* Opacity while dragging */
  transition: all 0.3s; /* Smooth transition */

  /* Additional styles as needed */
}
.dropHere {
  background: transparent;
  border: 2px dashed #1d2b64; /* Border style */
  color: #1d2b64; /* Text color */
  cursor: pointer; /* Cursor style */

  /* Additional styles as needed */
}

.dragArea {
  cursor: move;
}

.upload_wrapper_inner_img_cont img {
  width: 100%;
}

.upload_wrapper_inner_img_cont {
  position: relative;
}

.upload_wrapper_inner_img_cont .upload__img-close {
  right: -10px;
  top: -10px;
}
.here-btn {
  /* font-family: var(--font_cnikI10_default); */
  font-size: 13px;
  font-weight: 400;
  color: #fff;
  padding: 10px 10px;
  z-index: 3;
  background: #1d2b64;
  border-color: #1d2b64;
  transition: 0.3s;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid #1d2b64;
}

button.btn.btn-primary.next-step {
  color: #fff;
  /* background-color: #23286e; */
  border-color: #1d2b64;
  padding: 10px 18px;
  /* display: flex; */
  float: inline-end;
  background: #1d2b64;
  border-radius: 8px;
  margin-right: 16px;
}

.loaderDel {
  left: 13%;
}
.dragArea.list-group.w-full {
    padding-top: 0px;
}
.dragArea.list-group.w-full .image-container img {
    width: 385px;
    display: flex;
    justify-content: center;
    margin: 0px auto;
    max-height: 190px;
    /* max-height: 212px; */
}
.dragArea.list-group.w-full .image-container {
    /* position: relative; */
    display: flex;
    margin: 0px 0px 0px;
    /* width: 100%; */
    justify-content: center;
}
.menus-div:hover {
  cursor: all-scroll;
}

.sub-headingOne-btn:hover {
  cursor: all-scroll;
}

.panel-header .panel-header-title .panel-header-title-span {
    color: #1d2b64;
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    font-size: 20px;
}
</style>
