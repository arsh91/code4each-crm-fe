<script setup>
import NavBar from "@/components/dashboard/layouts/navbar.vue";
import SideBar from "@/components/dashboard/layouts/sidebar.vue";
import { useAuth } from "../../service/useAuth";
import { ref, onMounted } from "vue";
import FlashMessage from "@/components/common/FlashMessage.vue";
import { useStore } from "@/stores/store";
import WordpressService from "@/service/WordpressService";
import { EventBus } from "@/EventBus";

// Reactive variables
const { logout } = useAuth() || {};
const isSidebarToggled = ref(false);
const dashboardData = ref([]);
const store = useStore();
const plans = ref();
const planLoading = ref(false);

// Sidebar toggle handler
const navBarToggle = (value) => {
  isSidebarToggled.value = value;
};

const fetchDashboardData = async () => {
  try {
    const response = await WordpressService.fetchDashboardData();

    if (response.status === 200 && response.data.success) {
    //   loading.value = false;
      dashboardData.value = response.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Authentication failed. Please log in.", error);
      error.value = true;
    //   loading.value = false;
      localStorage.removeItem("access_token");
      router.push("/login");
    } else {
      console.error("An error occurred:", error.message);
    }
  }
};
const fetchPlans = async (paymentId) => {
  try {
    const response = await WordpressService.Payment.fetchPlans();
    console.log("Fetch Plans Response:", response);
    // if (response.status === 200 && response.data.success) {
    plans.value = response.data?.plans
    // }
  } catch (error) {
    console.error("Error:", error);
  }
};
const planDetail = ref({
  price: "",
  gst:"",
  total:"",
  razorPayId: "",
  id:""
});
const initiatePayment = (plan) => {
  planDetailModalShow.value = true
  const amount = Number(plan.price);
  const gst = amount * 0.18;
  const totalPrice = amount + gst;
  planDetail.value.price = amount;
  planDetail.value.gst = gst;
  planDetail.value.total = totalPrice;
  planDetail.value.razorPayId = plan.razor_id
  planDetail.value.id = plan.id
}
const planDetailModalShow = ref(false);
const hidePlanDeatilModal = () => {
  planDetailModalShow.value = false;
  // feedbackValues.value = {};
};
const submitPlayment = async(oderId, plan_id) => {
  let userData = dashboardData.value?.user
  console.log(userData)
  const options = {
    "key": "rzp_test_3kOO5za17PvQpv",
    "name": userData.name,
    'order_id': oderId,
    "description": "Payment",
    "handler": function (response){
      handleSubmission(response, plan_id);
    },
    "prefill": {
      "name": userData.name,
      "email": userData.email,
      "contact": userData.phone == "Na"?  "":  userData?.phone
    },
    "notes": {
      "address": dashboardData.value?.agency?.address,
      "order_id": 'subscriptionId' 
    },
    "theme": {
      "color": "#F37254"
    }
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
};
const createOrder = async(palnRazorId) => {
  try {
    console.log('ppppp',palnRazorId)
    planLoading.value = true
    const response = await WordpressService.Payment.createOrder({
      plan_id: palnRazorId
    });
    if (response.status === 200 ) {
     await submitPlayment(response.data.order_id, palnRazorId)
    }
    // await submitPlayment('order_OkhSuNKhU3qxd7') 
  } catch (error) {
    console.error("Error:", error);
  } 
  planLoading.value = false
  planDetailModalShow.value = false

};

const handleSubmission = async (responseh, plan_id) => {
  try {
    
    responseh.plan_id = plan_id; 
    responseh.user_id = dashboardData.value?.user.id; 
    responseh.agency_id = dashboardData.value?.user.agency_id; 
    responseh.website_id = dashboardData.value?.user.agency.agency_websites[0].website_detail.id; 
    console.log("Updated response:", responseh);
    const response = await WordpressService.subscriptionPayment(responseh);
    if (response.status === 200 && response.data.success) {
      console.log("Payment submitted successfully.");
      store.updateFlashMeassge(true, "Payment successful!");
      router.push("/dashboard");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
onMounted(async () => {
  fetchPlans();
  await fetchDashboardData();
  EventBus.on("fetchDashboardData", fetchDashboardData);
}); 
</script>
<template>
  <div class="page">
    <FlashMessage :visible="store.flashMeassge" v-if="store.flashMeassge" />
    <NavBar
      @logout="logout"
      @nav-bar-toggle="navBarToggle"
      :dashboardData="dashboardData?.user"
    />
    <SideBar
      :dashboardData="dashboardData"
      :toggled="isSidebarToggled"
    />
    <section class="content-wrapper main-content side-content">
      <div class="side-app">
        <div class="main-container container">
          <div id="wrapper">
            <div class="h-pricing-table__info price">
              <h2>Pick your perfect plan</h2>
              <p class="h-pricing-table__description">
                Get started in complete confidence. Our 15-days free trial guarantee means it's risk-free.
              </p>
            </div>
            <div class="row">
              <!-- Pricing Cards -->
              <div
                v-for="(plan, index) in plans"
                :key="index"
                class="col-md-6 col-lg-4 mb-4 pricing_card"
              >
                <div class="card text-center shadow h-100">
                  <div class="card-top-shape"></div>
                  <div class="card-body">
                    <h5 class="card-title">{{ plan.name }}</h5>
                    <p class="card-price display-4 mb-3"><i class="fa fa-rupee"></i>{{ plan.price }}<span class="card-month">{{ plan.price == "0" ? "/15 Days" : (plan.type == "monthly" ? "/mon" : (plan.type == "yearly" ? "/year" : "/15 Days")) }}  </span></p>
                    <hr />
                    <ul class="list-unstyled mb-4">
                      <li><i class="fa fa-check text-success"></i>You can create up to <strong>{{ plan.max_websites }}</strong> websites with this plan!
                      </li>
                    </ul>
                    <a v-if="plan.price != '0'" class="btn btn-primary" style="cursor: pointer" @click="initiatePayment(plan)"><i class="fa fa-paypal"></i> Payment</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div v-if="planDetailModalShow" class="modal-backdrop fade show"></div>
  <div
    class="modal feedback-model fade"
    id="modalContactForm"
    tabindex="-1"
    role="dialog"
    aria-labelledby="Feedback SpeedySites"
    aria-hidden="true"
    :class="{ show: planDetailModalShow, 'd-block': planDetailModalShow }"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header" style="border: 0">
          <button
            type="button"
            class="btn-close"
            @click="hidePlanDeatilModal"
            aria-hidden="true"
          ></button>
        </div>
        <div class="modal-body mx-3">
          <div class="card-layout layout-medium">
            <div class="content">
              <div class="close-button"></div>

              <h1 class="title">Plan Detail</h1>
              <p data-error="wrong" data-success="right" for="form34"
                >Amount : {{ planDetail.price }}</p
              >
              <p data-error="wrong" data-success="right" for="form34"
                >GST(18%) : {{ planDetail.gst }}</p
              >
              <p data-error="wrong" data-success="right" for="form34"
                >Total Amount : {{ planDetail.total }}</p
              >
             
              <div class="user-actions">
                <div v-if="planLoading" class="three-body3">
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                </div>
                <button class="feedback-btn-primary" @click="createOrder(planDetail.id)">
                  Send
                </button>

                <button
                  class="feedback-btn-outline"
                  data-dismiss="modal"
                  aria-hidden="true"
                  :disabled=planLoading
                  @click="hidePlanDeatilModal"
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
