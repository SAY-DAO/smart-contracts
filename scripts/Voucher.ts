import { BigNumberish, Contract } from "ethers";
import {
  CategoryDefinitionPersianEnum,
  CategoryEnum,
  NeedTypeEnum,
  SwProductVoucher,
  SwServiceVoucher,
} from "../helpers/types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const SIGNING_DOMAIN_NAME = "SAY-DAO";
const SIGNING_DOMAIN_VERSION = "1";

interface DomainData {
  name: string;
  version: string;
  verifyingContract: string;
  chainId: BigNumberish;
}

class Voucher {
  constructor() {}

  async designDomain(contract: Contract) {
    let domainData: DomainData;
    const chainId = await contract.getChainID();

    domainData = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: await contract.getAddress(),
      chainId,
    };
    return domainData;
  }

  async signSwTransaction({
    need,
    contract,
    signer,
  }: {
    need: any;
    contract: Contract;
    signer: HardhatEthersSigner;
  }) {
    let productVoucher: SwProductVoucher;
    let serviceVoucher: SwServiceVoucher;
    let types;
    const domain = await this.designDomain(contract);
    // define your data types
    if (need.type === NeedTypeEnum.SERVICE) {
      serviceVoucher = {
        needId: need.flaskId,
        title: need.title || "No Title",
        category:
          need.category === CategoryEnum.GROWTH
            ? CategoryDefinitionPersianEnum.GROWTH
            : need.category === CategoryEnum.HEALTH
            ? CategoryDefinitionPersianEnum.HEALTH
            : need.category === CategoryEnum.JOY
            ? CategoryDefinitionPersianEnum.JOY
            : CategoryDefinitionPersianEnum.SURROUNDING,
        paid: need.cost,
        bankTrackId: need.bankTrackId || "N/A",
        child: need.child.sayNameTranslations.fa,
        receipts: need.receipts.length,
        signer: signer.address,
        role: "Auditor", // string human readable
        content: `Your ${4} impacts will be ready for a RELATIVE to mint!`,
      } as const;

      types = {
        Voucher: [
          { name: "needId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "category", type: "string" },
          { name: "paid", type: "uint256" },
          { name: "child", type: "string" },
          { name: "bankTrackId", type: "string" },
          { name: "receipts", type: "uint256" },
          { name: "signer", type: "address" },
          { name: "role", type: "string" },
          { name: "content", type: "string" },
        ],
      };

      const signature = await signer.signTypedData(
        domain,
        types,
        serviceVoucher,
      );
      return {
        ...serviceVoucher,
        signature,
      };
    }
    if (need.type === NeedTypeEnum.PRODUCT) {
      productVoucher = {
        needId: need.flaskId,
        title: need.title || "No Title",
        category:
          need.category === CategoryEnum.GROWTH
            ? CategoryDefinitionPersianEnum.GROWTH
            : need.category === CategoryEnum.HEALTH
            ? CategoryDefinitionPersianEnum.HEALTH
            : need.category === CategoryEnum.JOY
            ? CategoryDefinitionPersianEnum.JOY
            : CategoryDefinitionPersianEnum.SURROUNDING,
        paid: need.cost,
        deliveryCode: need.deliveryCode,
        child: need.child.sayNameTranslations.fa,
        signer: await signer.getAddress(),
        role: "Social Worker", // string human readable
        content: ` با امضای دیجیتال این نیاز امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد. توکن های تولید شده از هر نیاز به افرادی که در برطرف شدن نیاز مشارکت داشته‌اند ارسال می‌شود، که می‌توانند از آن برای رای دادن، ارتقا کیفیت کودکان و سِی استفاده کنند.`,
      } as const;
      types = {
        Voucher: [
          { name: "needId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "category", type: "string" },
          { name: "paid", type: "uint256" },
          { name: "deliveryCode", type: "string" },
          { name: "child", type: "string" },
          { name: "role", type: "string" },
          { name: "content", type: "string" },
        ],
      };

      const swSignature = await signer.signTypedData(
        domain,
        types,
        productVoucher,
      );
      return {
        ...productVoucher,
        swSignature,
      };
    }
  }

  async signVFamilyTransaction({
    need,
    contract,
    signer,
  }: {
    need: any;
    contract: Contract;
    signer: HardhatEthersSigner;
  }) {
    let productVoucher: SwProductVoucher;
    let serviceVoucher: SwServiceVoucher;
    let types;
    const domain = await this.designDomain(contract);
    // define your data types
    if (need.type === NeedTypeEnum.SERVICE) {
      serviceVoucher = {
        needId: need.flaskId,
        title: need.title || "No Title",
        category:
          need.category === CategoryEnum.GROWTH
            ? CategoryDefinitionPersianEnum.GROWTH
            : need.category === CategoryEnum.HEALTH
            ? CategoryDefinitionPersianEnum.HEALTH
            : need.category === CategoryEnum.JOY
            ? CategoryDefinitionPersianEnum.JOY
            : CategoryDefinitionPersianEnum.SURROUNDING,
        paid: need.cost,
        bankTrackId: need.bankTrackId || "N/A",
        child: need.child.sayNameTranslations.fa,
        receipts: need.receipts.length,
        signer: signer.address,
        role: "Auditor", // string human readable
        content: `Your ${4} impacts will be ready for a RELATIVE to mint!`,
      } as const;

      types = {
        Voucher: [
          { name: "needId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "category", type: "string" },
          { name: "paid", type: "uint256" },
          { name: "child", type: "string" },
          { name: "bankTrackId", type: "string" },
          { name: "receipts", type: "uint256" },
          { name: "signer", type: "address" },
          { name: "role", type: "string" },
          { name: "content", type: "string" },
        ],
      };

      const signature = await signer.signTypedData(
        domain,
        types,
        serviceVoucher,
      );
      return {
        ...serviceVoucher,
        signature,
      };
    }
    if (need.type === NeedTypeEnum.PRODUCT) {
      productVoucher = {
        needId: need.flaskId,
        title: need.title || "No Title",
        category:
          need.category === CategoryEnum.GROWTH
            ? CategoryDefinitionPersianEnum.GROWTH
            : need.category === CategoryEnum.HEALTH
            ? CategoryDefinitionPersianEnum.HEALTH
            : need.category === CategoryEnum.JOY
            ? CategoryDefinitionPersianEnum.JOY
            : CategoryDefinitionPersianEnum.SURROUNDING,
        paid: need.cost,
        deliveryCode: need.deliveryCode,
        child: need.child.sayNameTranslations.fa,
        signer: await signer.getAddress(),
        role: "Social Worker", // string human readable
        content: ` با امضای دیجیتال این نیاز امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد. توکن های تولید شده از هر نیاز به افرادی که در برطرف شدن نیاز مشارکت داشته‌اند ارسال می‌شود، که می‌توانند از آن برای رای دادن، ارتقا کیفیت کودکان و سِی استفاده کنند.`,
      } as const;
      types = {
        Voucher: [
          { name: "needId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "category", type: "string" },
          { name: "paid", type: "uint256" },
          { name: "deliveryCode", type: "string" },
          { name: "child", type: "string" },
          // { name: "signer", type: "address" },
          { name: "role", type: "string" },
          { name: "content", type: "string" },
        ],
      };

      const swSignature = await signer.signTypedData(
        domain,
        types,
        productVoucher,
      );
      return {
        ...productVoucher,
        swSignature,
      };
    }
  }
}

export default Voucher;
