import { AppDataSource } from "./config/database";
import { User } from "./models/User";
import bcrypt from "bcrypt";

const createAdmin = async () => {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    // Kiểm tra nếu tài khoản đã tồn tại
    const existingAdmin = await userRepository.findOne({
      where: { phone: "12345679" }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("12345679", 10);
      const admin = userRepository.create({
        phone: "12345679",
        password: hashedPassword,
        name: "panhcute",
        role: "admin"
      });

      await userRepository.save(admin);
      console.log("Tạo tài khoản admin thành công!");
    } else {
      console.log("Tài khoản admin đã tồn tại!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error);
    process.exit(1);
  }
};

createAdmin();