import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";

async function main() {
  const client = new PrismaClient();

  try {
    if ("referenceTable" in client) {
      // @ts-ignore
      await client.referenceTable.findFirst();
    } else if ("tableX" in client) {
      // @ts-ignore
      await client.tableX.findFirst();
    } else {
      console.log("This `try.ts` tool is limited.");
      console.log(
        "To support both schemas, it needs to have either `referenceTable` or `tableX`."
      );
      console.log(
        "You can edit this out in case you want to test something else."
      );
    }

    console.log("It succeeded!");
  } catch (error) {
    if (!/MaxBufferError/.test(error as string)) {
      console.error(error);
      throw error;
    }

    const out = "/tmp/prisma-investigation-error.log";

    await writeFile(out, JSON.stringify(error, null, 2));

    console.log(`Failed! The output is availabe in ${out}.`);
    console.log("Opening with VS Code may get your editor stuck");
    console.log("");
    console.log("You can try opening it using `head`");
    console.log("The first 6 lines contain some details:");
    console.log(`$ head -n 6 ${out}`);
    throw error;
  } finally {
    await client.$disconnect();
  }
}

main().catch(() => process.exit(1));
