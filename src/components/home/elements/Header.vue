<script setup>
import RegisterButton from "../../common/RegisterButton.vue";
</script>
 <template>
  <div>
    <header class="header position-absolute" id="header-wrap">
      <div class="container">
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-dark navbar-bg-light">
          <div class="navbar-brand" href="#">
            <a href="index.html"><img src="/images/black-logo.png" /></a>
          </div>
          <button
            class="navbar-toggler ms-auto ms-md-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <!-- Left links -->
            <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>
            <!-- Left links -->
            <div class="d-flex align-items-center">
              <router-link to="/login" class="btn btn-primary me-3"
                >Login To Desktop</router-link
              >
            </div>
          </div>
          <!-- Collapsible wrapper -->

          <!-- Container wrapper -->
        </nav>
        <!-- Navbar -->
      </div>
    </header>

    <section class="custom-py-1 position-relative hero-shape3 overflow-hidden">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-12 col-lg-5 col-xl-6 order-lg-2 mb-8 mb-lg-0">
            <!-- Image -->
            <img src="/images/02.png" class="img-fluid" alt="..." />
          </div>
          <div class="col-12 col-lg-7 col-xl-6 order-lg-1">
            <h1 class="display-4 mb-3">
              The World’s
              <span class="font-w-7">Fastest WordPress &amp; Hosting</span>
            </h1>
            <p class="lead text-muted mb-4">
              We use the latest technologies to build a Beautiful, Clean &amp;
              Modern Design website with flexible Bootstrap components.
            </p>

            <!-- Button to open the modal using Vue -->
            <RegisterButton
              buttonClass="btn-sm btn-primary text-start me-1"
              :paragraph="true"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
