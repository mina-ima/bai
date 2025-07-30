-- CreateTable
CREATE TABLE "public"."Product" (
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_shippingName" TEXT,
    "product_shippingPostalcode" TEXT,
    "product_shippingAddress" TEXT,
    "product_shippingPhone" TEXT,
    "product_tax" INTEGER NOT NULL,
    "product_unit" TEXT NOT NULL,
    "product_unitPrice" INTEGER NOT NULL,
    "product_note" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "customer_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_formalName" TEXT,
    "customer_postalCode" TEXT,
    "customer_address" TEXT,
    "customer_phone" TEXT,
    "customer_mail" TEXT,
    "customer_contactPerson" TEXT,
    "customer_rounding" TEXT NOT NULL,
    "customer_closingDay" TEXT,
    "customer_paymentTerms" TEXT,
    "invoiceDeliveryMethod" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "public"."CompanyInfo" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_postalCode" TEXT,
    "company_address" TEXT,
    "company_phone" TEXT,
    "company_fax" TEXT,
    "company_mail" TEXT,
    "company_contactPerson" TEXT,
    "company_bankName" TEXT,
    "company_bankBranch" TEXT,
    "company_bankType" TEXT,
    "company_bankNumber" TEXT,
    "company_bankHolder" TEXT,
    "company_invoiveNumber" TEXT,

    CONSTRAINT "CompanyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Delivery" (
    "delivery_id" TEXT NOT NULL,
    "delivery_name" TEXT NOT NULL,
    "delivery_quantity" INTEGER NOT NULL,
    "delivery_unitPrice" INTEGER NOT NULL,
    "delivery_unit" TEXT NOT NULL,
    "delivery_note" TEXT,
    "delivery_tax" INTEGER NOT NULL,
    "delivery_orderId" TEXT,
    "delivery_salesGroup" TEXT,
    "customer_name" TEXT NOT NULL,
    "delivery_number" TEXT NOT NULL,
    "delivery_invoiceNumber" TEXT,
    "delivery_status" TEXT NOT NULL,
    "delivery_invoiceStatus" TEXT,
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("delivery_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_delivery_number_key" ON "public"."Delivery"("delivery_number");

-- AddForeignKey
ALTER TABLE "public"."Delivery" ADD CONSTRAINT "Delivery_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Delivery" ADD CONSTRAINT "Delivery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;
