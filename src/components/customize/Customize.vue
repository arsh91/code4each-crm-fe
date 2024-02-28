<script setup>
import NavBar from "@/components/dashboard/layouts/navbar.vue";
import SideBar from "@/components/dashboard/layouts/sidebar.vue";
import { useAuth } from "@/service/useAuth";
import { useRouter } from "vue-router";
import { ref, defineProps, onMounted, provide, inject, watch } from "vue";
import WordpressService from "@/service/WordpressService";
import Modal from "@/components/common/Modal.vue";
import Loader from "@/components/common/Loader.vue";
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
import FlashMessage from "@/components/common/FlashMessage.vue";

const router = useRouter();
const { logout } = useAuth();
const isSidebarToggled = ref(false);
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
const deleteLoading = ref(false);
const deleteComponentImageModal = ref(false);

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

const getActiveComponentsData = async () => {
  try {
    const response = await WordpressService.Components.getActiveComponents({
      website_url: siteSettingsDeatil.value?.website_domain,
    });

    if (response.status === 200 && response.data.success) {
      activeComponentsDetail.value = response.data.components_detail;
      let firstActiveComponent = activeComponentsDetail.value[0];
      await openModal(
        firstActiveComponent.type,
        firstActiveComponent.id,
        firstActiveComponent.preview
      );

      activeComponentsDetail.value.forEach((image) => {
        activeComponentsDetail.dragging = false;
      });
      updateItemPositions();
      buttonStates.value = new Array(activeComponentsDetail.value.length).fill(
        false
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const openModal = async (compType, oldComponentUniqueeId, src) => {
  try {
    newComponent.value = null;
    const response = await WordpressService.Components.getAllComponents({
      type: compType,
    });
    if (response.status === 200 && response.data.success) {
      allComponentsDetailAccToType.value = response.data.component;
      oldComponent.value = oldComponentUniqueeId;
      oldComponentType.value = compType;
      selectedComponentPreviewImgSrc.value = src;
      await getComponentsImages();
      await handleEditComponentBtnClick(
        oldComponent.value,
        oldComponentType.value
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  showModal.value = true;
};

onMounted(async () => {
  fileInput.value = ref.fileInput;
  await getSiteDeatils();
  await fetchDashboardData();
  await getActiveComponentsData();
  loadingForComonents.value = false;
});

watch(
  () => store.websiteId,
  async (newWebsiteId, oldWebsiteId) => {
    await getSiteDeatils();
    await fetchDashboardData();
    await getActiveComponentsData();
  }
);

provide("dashBoardMethods", {
  fetchDashboardData,
});

const closeModal = () => {
  allComponentsDetailAccToType.value = [];
  showModal.value = false;
  showEditComponentFieldModal.value = false;
  selectedImage.value = null;
  siteSettingsFormFields.value = null;
  showEditMupltipleImagesModal.value = false;
  uploadedFiles.value = [];
  fileInput.value = null;
};

const showSelectedComponent = (component_unique_id) => {
  if (component_unique_id === oldComponent.value) {
    return;
  }
  selectedImage.value = component_unique_id;
  newComponent.value = component_unique_id;
};

const changeComponent = async () => {
  try {
    loading.value = true;
    btnDisable.value = true;
    loadingForComonents.value = true;

    const response = await WordpressService.Components.changeComponent({
      website_url: siteSettingsDeatil.value?.website_domain,
      component_unique_id_old: oldComponent.value,
      component_unique_id_new: newComponent.value,
    });

    if (response.status === 200) {
      store.updateFlashMeassge(true, "Changes Saved Sucessfully");
      await getActiveComponentsData();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  loadingForComonents.value = false;
  btnDisable.value = false;
  loading.value = false;
};

const handleEditComponentBtnClick = async (componentUniqueId, type) => {
  componentsFieldsUnderEdit.value.id = componentUniqueId;
  componentsFieldsUnderEdit.value.type = type;
  try {
    const response =
      await WordpressService.ComponentsFormField.getComponentsFormField({
        component_unique_id: componentUniqueId,
        website_url: siteSettingsDeatil.value?.website_domain,
      });
    if (response.status === 200 && response.data.success) {
      siteSettingsFormFields.value = response.data.data;
      showEditComponentFieldModal.value = true;
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const submitCustomFields = async (data) => {
  try {
    loading.value = true;
    btnDisable.value = true;
    const formFields = Object.keys(data).reduce((acc, key) => {
      let meta1 = null;
      let meta2 = null;

      let modifiedString = key.replace(/-meta1|-meta2/g, "");

      // Check if field_name already exists
      const existingFieldIndex = acc.findIndex(
        (field) => field.field_name === modifiedString
      );

      if (existingFieldIndex !== -1) {
        // If the field_name already exists, update meta1 and meta2 values
        const existingField = acc[existingFieldIndex];
        meta1 =
          existingField.meta1 ||
          (key.includes("meta1") ? data[key] : undefined);
        meta2 =
          existingField.meta2 ||
          (key.includes("meta2") ? data[key] : undefined);

        // Update the existing entry
        acc[existingFieldIndex] = {
          ...existingField,
          meta1: meta1,
          meta2: meta2,
        };
      } else {
        acc.push({
          field_name: modifiedString,
          field_value: data[key],
          type: componentsFieldsUnderEdit.value.type,
          meta1: meta1,
          meta2: meta2,
          field_type: null,
        });
      }
      return acc;
    }, []);

    const response =
      await WordpressService.ComponentsFormField.updateComponentsFormField({
        website_url: siteSettingsDeatil.value?.website_domain,
        component_unique_id: componentsFieldsUnderEdit.value.id,
        form_fields: formFields,
      });
    if (response.status === 200 && response.data.success) {
      loadingForComonents.value = false;
      store.updateFlashMeassge(true, "Changes Saved Sucessfully");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  btnDisable.value = false;
  loading.value = false;
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

const onEndComponentPosition = (evt) => {
  saveComponentPositionBtn.value = true;
  console.log("end");
  for (const itemId in itemDraggingStates.value) {
    itemDraggingStates.value[itemId] = false;
  }
};

const onStartComponentPosition = (evt) => {
  saveComponentPositionBtn.value = false;
};

const saveComponentPosition = async () => {
  try {
    loading.value = true;
    loadingForComonents.value = true;
    saveComponentPositionBtn.value = false;
    const response = await WordpressService.Components.changeComponentPosition({
      updated_positions: storeComponentsPosition.value,
      website_url: siteSettingsDeatil.value?.website_domain,
    });
    if (response.status === 200 && response.data.success) {
      Swal.fire({
        title: "<strong>Saved!</strong>",
        icon: "success",
        html:
          "Changes Saved Successfully, " +
          '<a href="' +
          siteSettingsDeatil.value?.website_domain +
          '" target= "_blank">preview your site</a> ',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
      });
      getActiveComponentsData();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  loadingForComonents.value = false;
  loading.value = false;
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

const handleFileUpload = () => {
  const files = fileInput.value.files;
  uploadedFiles.value = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    uploadedFiles.value.push(file);
  }
};
const getImageUrl = (file) => {
  return window.URL.createObjectURL(file);
};

const handleEditImagesModal = async (componentUniqueId, type) => {
  loading.value = true;
  componentsFieldsUnderEdit.value.id = componentUniqueId;
  componentsFieldsUnderEdit.value.type = type;
  showEditMupltipleImagesModal.value = true;
  getComponentsImages();
  loading.value = false;
};

const getComponentsImages = async () => {
  try {
    const response =
      await WordpressService.ComponentsFormField.getComponentsImages({
        type: oldComponentType.value,
        website_url: siteSettingsDeatil.value?.website_domain,
      });

    if (response.status === 200 && response.data.success) {
      componentImagesAcctoType.value = response.data.data;
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const submitForm = async () => {
  try {
    loading.value = true;
    if (uploadedFiles.value.length < 1) {
      return;
    }
    btnDisable.value = true;
    const formData = new FormData();
    const files = uploadedFiles.value;
    for (let i = 0; i < files.length; i++) {
      formData.append("uploaded_images[]", files[i]);
    }
    let fieldType = componentsFieldsUnderEdit.value.type;
    if (fieldType.includes("_")) {
      const aboutArray = fieldType.split("_");
      fieldType = aboutArray[0].trim();
    }

    formData.append("type", fieldType);
    formData.append("website_url", siteSettingsDeatil.value?.website_domain);

    const customHeaders = {
      "Content-Type": "multipart/form-data",
    };

    const response =
      await WordpressService.ComponentsFormField.updateComponentImages(
        formData,
        customHeaders
      );
    if (response.status === 200 && response.data.success) {
      store.updateFlashMeassge(true, "Changes Saved Sucessfully");
      btnDisable.value = false;
      getComponentsImages();
    }
  } catch (error) {
    console.error(error);
  }
  uploadedFiles.value = [];
  loading.value = false;
  fileInput.value = null;
  loading.value = false;
};

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1);
};

const deleteComponentImage = async () => {
  try {
    loading.value = true;
    deleteLoading.value = true;
    let deleteImages = [];
    deleteImages.push(selectedDeletedImageUrl.value);
    const response =
      await WordpressService.ComponentsFormField.deleteComponentImage({
        delete_images: deleteImages,
        website_url: siteSettingsDeatil.value?.website_domain,
      });
    if (response.status === 200 && response.data.success) {
      getComponentsImages();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
  deleteLoading.value = false;
  deleteComponentImageModal.value = false;
  loading.value = false;
};
const deleteComponentImageConfirmShow = (imageUrl) => {
  selectedDeletedImageUrl.value = imageUrl;
  deleteComponentImageModal.value = true;
};

const handleTabClick = () => {
  loading.value = true;
  if (currentTab.value === "field") {
    EventBus.emit("submitFormChildMethod");
  } else if (currentTab.value === "button") {
    EventBus.emit("submitButtonFormChildMethod");
  } else if (currentTab.value === "image") {
    submitForm();
  }
  loading.value = false;
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
          <div id="wrapper" :class="loading ? 'fade' : ''">
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
                  :class="oldComponent === compValue.id ? 'active' : ''"
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
        <!-- <hr /> -->

        <div class="ifYqM">
          <div class="control-horizontal-tabs arrowed tabs-block">
            <div class="tabs">
              <input type="radio" name="tabs" id="tab1" />
              <label for="tab1"> <i class="fa fa-pencil"></i>Content</label>
              <div class="tab">
                <div class="oQFZy T5IOE">
                  <div data-hook="switch-layout-panel" class="ITm2u">
                    <div data-hook="switch-layout-content">
                      <div class="tabs-wrappers">
                        <ul
                          class="nav nav-tabs justify-content-center"
                          role="tablist"
                        >
                          <li class="nav-item" @click="currentTab = 'image'">
                            <a
                              class="nav-link active"
                              data-toggle="tab"
                              href="#Images"
                              role="tab"
                            >
                              <i class="now-ui-icons objects_umbrella-13"></i>
                              Images
                            </a>
                          </li>
                          <li class="nav-item" @click="currentTab = 'button'">
                            <a
                              class="nav-link"
                              data-toggle="tab"
                              href="#Buttons"
                              role="tab"
                            >
                              <i class="now-ui-icons shopping_cart-simple"></i
                              >Button
                            </a>
                          </li>

                          <li class="nav-item" @click="currentTab = 'field'">
                            <a
                              class="nav-link"
                              data-toggle="tab"
                              href="#Field"
                              role="tab"
                            >
                              <i class="now-ui-icons ui-2_settings-90"></i>Field
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div class="tabs-contents">
                        <div class="tab-content text-center">
                          <div
                            class="tab-pane active"
                            id="Images"
                            role="tabpanel"
                          >
                            <div class="multi-img">
                              <div
                                v-for="(
                                  allComponentImage, index
                                ) in componentImagesAcctoType"
                                :key="index"
                              >
                                <div class="img-wrapper active">
                                  <i
                                    class="fa fa-times"
                                    aria-hidden="true"
                                    data-toggle="modal"
                                    data-target="#MyModal"
                                    @click="
                                      deleteComponentImageConfirmShow(
                                        allComponentImage.value
                                      )
                                    "
                                  ></i>
                                  <img :src="allComponentImage.value" />
                                </div>
                              </div>
                            </div>
                            <div class="upload__box">
                              <div class="upload__btn-box">
                                <label class="upload__btn">
                                  <p>Upload images</p>
                                  <input
                                    type="file"
                                    ref="fileInput"
                                    multiple
                                    @change="handleFileUpload"
                                    data-max_length="20"
                                    class="upload__inputfile"
                                  />
                                </label>
                              </div>

                              <div
                                class="upload__img-wrap upload_wrapper_cont"
                                v-if="uploadedFiles?.length > 0"
                              >
                                <div
                                  v-for="(file, index) in uploadedFiles"
                                  :key="index"
                                >
                                  <div
                                    class="upload__img-box upload_wrapper_inner_img_cont"
                                  >
                                    <img :src="getImageUrl(file)" />
                                    <div
                                      class="upload__img-close"
                                      @click="removeFile(index)"
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="tab-pane" id="Buttons" role="tabpanel">
                            <EditSiteSettingsButtonFormBuilder
                              :siteSettingsFormFields="siteSettingsFormFields"
                              @submit-custom-fields="submitCustomFields"
                            />
                          </div>
                          <div class="tab-pane" id="Field" role="tabpanel">
                            <EditSiteSettingsFormBuilder
                              :siteSettingsFormFields="siteSettingsFormFields"
                              @submit-custom-fields="submitCustomFields"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="button-wrapper">
                        <button
                          type="submit"
                          class="preview-btn"
                          @click="handleTabClick"
                          :disabled="btnDisable"
                        >
                          <i class="fa fa-upload" aria-hidden="true"></i>
                          Publish
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

              <input type="radio" name="tabs" id="tab2" checked="checked" />
              <label for="tab2"> <i class="fa fa-th-large"></i>Layout </label>
              <div class="tab">
                <div class="oQFZy T5IOE">
                  <div data-hook="switch-layout-panel" class="ITm2u">
                    <div data-hook="switch-layout-content">
                      <div class="dqqBJ">
                        <span
                          data-hook="Text"
                          data-enable-ellipsis="true"
                          data-disabled="false"
                          class="control-text size-small weight-normal skin-standard"
                        >
                          <span class="has-tooltip">
                            <div
                              class="tooltip-on-ellipsis-content singleLine"
                              data-hook="tooltip-on-ellipsis-content--container"
                            >
                              Current layout
                            </div>
                          </span>
                        </span>
                        <span class="has-tooltip info-icon-tooltip">
                          <span
                            class="control-info-icon"
                            data-hook="info-icon-root"
                          >
                            <i
                              class="fa fa-exclamation-circle"
                              aria-hidden="true"
                            ></i>
                          </span>
                        </span>
                      </div>
                      <div
                        :class="newComponent ? 'new-layout' : 'Current-layout'"
                      >
                        {{ newComponent }}
                        <i
                          class="fa fa-check"
                          aria-hidden="true"
                          v-if="!newComponent"
                        ></i>
                        <img
                          :src="
                            config.CRM_API_URL +
                            '/' +
                            selectedComponentPreviewImgSrc
                          "
                        />
                      </div>
                      <div class="dqqBJ">
                        <span
                          data-hook="Text"
                          data-enable-ellipsis="true"
                          data-disabled="false"
                          class="control-text size-small weight-normal skin-standard"
                        >
                          <span class="has-tooltip">
                            <div
                              class="tooltip-on-ellipsis-content singleLine"
                              data-hook="tooltip-on-ellipsis-content--container"
                            >
                              Choose a new layout
                            </div>
                          </span>
                        </span>
                        <span class="has-tooltip info-icon-tooltip">
                          <span
                            class="control-info-icon"
                            data-hook="info-icon-root"
                          >
                            <i
                              class="fa fa-exclamation-circle"
                              aria-hidden="true"
                            ></i>
                          </span>
                        </span>
                      </div>
                      <div
                        v-for="(
                          allComponentValue, index
                        ) in allComponentsDetailAccToType"
                        :key="index"
                      >
                        <div
                          :class="
                            newComponent ==
                            allComponentValue.component_unique_id
                              ? 'Current-layout'
                              : 'new-layout'
                          "
                          v-if="
                            oldComponent !=
                            allComponentValue.component_unique_id
                          "
                          @click="
                            newComponent = allComponentValue.component_unique_id
                          "
                        >
                          <i
                            class="fa fa-check"
                            aria-hidden="true"
                            v-if="
                              newComponent ===
                              allComponentValue.component_unique_id
                            "
                          ></i>

                          <img
                            :src="
                              config.CRM_API_URL +
                              '/' +
                              allComponentValue.preview
                            "
                          />
                        </div>
                      </div>
                    </div>

                    <div class="button-wrapper">
                      <button
                        type="submit"
                        class="preview-btn"
                        @click="changeComponent"
                        :disabled="btnDisable"
                      >
                        <i class="fa fa-upload" aria-hidden="true"></i>
                        Publish
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
          </div>
        </div>
      </div>
    </div>
    <Loader v-if="loading" />
  </div>
  <DeleteModal @confirm="deleteComponentImage" :loading="deleteLoading" />
  <ConfirmModal
    modalTitle="Confirm!"
    modalText="Do you really want to regenrate .This will regenrate your site"
    @confirm="regenerateWebsite"
    confirmText="Submit"
  />
  <ProcessCompleteModal
    modalTitle="Awesome!"
    modalText="Your website Regenerated successfully"
    confirmText="Preview"
    @confirm="openLinkInNewTab(siteSettingsDeatil.website_domain)"
  />

  <!-- <div class="page" id="dasboardPage">
    <div class="page-main">
      <div id="wrapper" :class="{ toggled: isSidebarToggled }">
        <SideBar :dashboardData="dashboardData"></SideBar>
        <NavBar
          @logout="logout"
          @nav-bar-toggle="navBarToggle"
          :dashboardData="dashboardData?.user"
        ></NavBar>
        <div v-if="loadingForComonents">
          <div class="spinner-container">
            <div class="spinner-border text-warning" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <section v-else id="content-wrapper main-content side-content">
          <Modal
            :show-modal="showModal"
            @update:show-modal="showModal = $event"
            modal-id="customizeModal"
            :show-footer="false"
          >
            <template #header>
              <h4 class="modal-title text-center" id="customizeModalLabel">
                Change {{ capitalizeAndReplaceChar(oldComponentType, "_") }}
              </h4>
              <button
                type="button"
                class="close"
                @click="closeModal"
                data-dismiss="modal"
              >
                <span aria-hidden="true">×</span>
              </button>
            </template>
            <div class="testimonial-container">
              <div
                v-for="(
                  allComponentValue, index
                ) in allComponentsDetailAccToType"
                :key="index"
                class="testimonial"
                :class="{
                  flagWiseImg:
                    selectedImage === allComponentValue.component_unique_id,
                }"
                @click="
                  showSelectedComponent(
                    allComponentValue.component_unique_id,
                    config.CRM_API_URL + '/' + allComponentValue.preview
                  )
                "
              >
                <div
                  class=""
                  :class="{
                    imageContainer:
                      allComponentValue.component_unique_id === oldComponent,
                  }"
                >
                  <img
                    :src="config.CRM_API_URL + '/' + allComponentValue.preview"
                    alt="Dynamic"
                    class="testimonialImg"
                    :class="{
                      'disabled-image':
                        allComponentValue.component_unique_id === oldComponent,
                    }"
                  />
                </div>
              </div>
            </div>
          </Modal>
          <Modal
            :show-modal="showEditComponentFieldModal"
            @update:show-modal="showEditComponentFieldModal = $event"
            modal-id="customizeModal"
            :show-footer="false"
          >
            <template #header>
              <h4 class="modal-title text-center" id="customizeModalLabel">
                {{
                  capitalizeAndReplaceChar(componentsFieldsUnderEdit.type, "_")
                }}
                Settings
              </h4>
              <button
                type="button"
                class="close"
                @click="closeModal"
                data-dismiss="modal"
              >
                <span aria-hidden="true">×</span>
              </button>
            </template>
            <EditSiteSettingsFormBuilder
              :siteSettingsFormFields="siteSettingsFormFields"
              @submit-custom-fields="submitCustomFields"
            />
            <div v-if="loading">
              <div class="spinner-container">
                <div class="spinner-border text-warning" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </Modal>
          <Modal
            :show-modal="showEditMupltipleImagesModal"
            @update:show-modal="showEditMupltipleImagesModal = $event"
            modal-id="customizeModal"
            :show-footer="false"
          >
            <template #header>
              <h4 class="modal-title text-center" id="customizeModalLabel">
                {{
                  capitalizeAndReplaceChar(componentsFieldsUnderEdit.type, "_")
                }}
                Settings
              </h4>
              <button
                type="button"
                class="close"
                @click="closeModal"
                data-dismiss="modal"
              >
                <span aria-hidden="true">×</span>
              </button>
            </template>
            <div class="testimonial-container">
              <div
                v-for="(allComponentImage, index) in componentImagesAcctoType"
                :key="index"
                class="testimonial"
              >
                <div>
                  <img
                    :src="allComponentImage.value"
                    alt="Dynamic"
                    class="testimonialImg"
                  />
                  <button
                    @click="
                      deleteComponentImageConfirmShow(allComponentImage.value)
                    "
                    style="
                      position: absolute;
                      background: white;
                      border: none;
                      cursor: pointer;
                    "
                    class="ml-2"
                  >
                    &#10006;
                  </button>
                </div>
              </div>
            </div>
            <form @submit.prevent="submitForm" enctype="multipart/form-data">
              <input
                type="file"
                ref="fileInput"
                multiple
                @change="handleFileUpload"
              />

              <div v-if="uploadedFiles?.length > 0">
                <h4 class="mt-2">Selected Files:</h4>
                <ul>
                  <li v-for="(file, index) in uploadedFiles" :key="index">
                    <img
                      :src="getImageUrl(file)"
                      alt="Uploaded Image"
                      width="200"
                      class="mb-3"
                    />
                    <button
                      @click="removeFile(index)"
                      style="
                        position: absolute;
                        background: white;
                        border: none;
                        cursor: pointer;
                      "
                      class="ml-2"
                    >
                      &#10006;
                    </button>
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                :disabled="
                  uploadedFiles.length <= 0 || disableImageSubmitButton
                "
                class="btn btn-success mt-4 me-2"
              >
                Submit
              </button>
            </form>
            <div v-if="loading">
              <div class="spinner-container">
                <div class="spinner-border text-warning" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </Modal>
          <div class="side-app">
            <div class="main-container container-fluid">
              <div class="row">
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
                      width="800"
                      :class="{
                        dragItem: compValue.dragging,
                      }"
                    />
                    <div class="button-container">
                      <button
                        class="btn btn-primary custom-button image-button me-2"
                        @click="openModal(compValue.type, compValue.id)"
                      >
                        Change
                      </button>
                      <button
                        class="btn btn-primary custom-button image-button me-2"
                        @click="
                          handleEditComponentBtnClick(
                            compValue.id,
                            compValue.type
                          )
                        "
                      >
                        Edit
                      </button>
                      <button
                        class="btn btn-primary custom-button image-button"
                        @click="
                          handleEditImagesModal(compValue.id, compValue.type)
                        "
                      >
                        Edit Images
                      </button>
                    </div>
                  </div>
                </VueDraggableNext>
              </div>

              <button
                type="button"
                v-if="saveComponentPositionBtn"
                @click="saveComponentPosition"
                class="btn btn-success mt-4 me-2"
              >
                Submit
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div> -->
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

/* 
.custom-button:hover {
  background-color: rgba(21, 62, 105, 0.2);
  opacity: 1;
} */

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
  background-color: #f1f1f1; /* Background color */
  border: 2px solid #666; /* Border style */
  color: #333; /* Text color */
  cursor: grab; /* Cursor style */
  opacity: 0.7; /* Opacity while dragging */
  transition: all 0.3s; /* Smooth transition */

  /* Additional styles as needed */
}
.dropHere {
  background-color: #e1e1e1; /* Background color */
  border: 2px dashed #666; /* Border style */
  color: #555; /* Text color */
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
</style>
