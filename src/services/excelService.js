import * as XLSX from 'xlsx';

class ExcelService {
  constructor() {
    this.templateUrl = 'https://docs.google.com/spreadsheets/d/1zjRfnTCH_gxBQpQ7-jN4O3KmY9ew_oHjMb629narNok/edit?gid=0#gid=0';
  }

  // Danh sách nguyên liệu theo thứ tự cố định
  getFixedIngredientOrder() {
    return [
      'CÀ PHÊ',
      'SỮA ĐẶC',
      'MỨT VIỆT QUẤT',
      'CỐT DỪA (400ML/ LON)',
      'TRÀ COZY (100 GÓI)',
      'TRÀ GỪNG',
      'MATCHA',
      'MẬT ONG (1000ML/ CHAI)',
      'THUỐC 3 SỐ VIỆT',
      'THUỐC MÈO MI',
      'THUỐC MÈO ĐỎ',
      'HƯỚNG DƯƠNG',
      'BÁNH GẤU',
      'BÁNH TAI HEO',
      'BÁNH QUE',
      'SỮA TƯƠI (1L/ HỘP)',
      'SỮA OATSIDE (1L/ HỘP)',
      'RICH (454G/ HỘP)',
      'SỮA CHUA (100G/ HỦ)',
      'PEPSI',
      'STING',
      'REDBULL',
      'ỔI',
      'CAM SÀNH',
      'THƠM',
      'DỪA',
      'TÁO',
      'BƠ',
      'NẮP UỐNG TRỰC TIẾP',
      'LY PET 360ML (50 LY/ CÂY)'
    ];
  }

  // Tạo dữ liệu kiểm kê từ inventory data theo thứ tự cố định
  generateInventoryData(inventoryData, ingredients) {
    const inventoryArray = [];
    const fixedOrder = this.getFixedIngredientOrder();
    
    // Header row
    inventoryArray.push([
      'STT',
      'Tên nguyên liệu', 
      'Đơn vị',
      'Số lượng hiện có',
      'Số lượng kiểm kê',
      'Chênh lệch',
      'Ghi chú'
    ]);

    // Data rows theo thứ tự cố định
    fixedOrder.forEach((ingredientName, index) => {
      // Tìm ingredient trong danh sách ingredients
      const ingredient = ingredients.find(ing => 
        ing.name.toUpperCase() === ingredientName.toUpperCase() ||
        ing.name.toUpperCase().includes(ingredientName.toUpperCase()) ||
        ingredientName.toUpperCase().includes(ing.name.toUpperCase())
      );
      
      if (ingredient) {
        // Tìm trong inventoryData
        const ingredientId = Object.keys(inventoryData).find(id => {
          const invIngredient = ingredients.find(ing => 
            ing.id === id || 
            ing.id === parseInt(id).toString() ||
            ing.ingredientId === parseInt(id)
          );
          return invIngredient && invIngredient.id === ingredient.id;
        });
        
        const currentQuantity = ingredientId ? (inventoryData[ingredientId] || 0) : 0;
        const countedQuantity = 0; // Sẽ được nhập khi kiểm kê
        const difference = countedQuantity - currentQuantity;
        
        inventoryArray.push([
          index + 1,
          ingredientName, // Sử dụng tên cố định
          ingredient.unit,
          currentQuantity,
          countedQuantity,
          difference,
          ''
        ]);
      } else {
        // Nếu không tìm thấy ingredient, vẫn thêm vào với dữ liệu mặc định
        inventoryArray.push([
          index + 1,
          ingredientName,
          'g', // Đơn vị mặc định
          0,
          0,
          0,
          'Chưa có trong hệ thống'
        ]);
      }
    });

    return inventoryArray;
  }

  // Tạo dữ liệu báo cáo tổng hợp
  generateSummaryData(menuItems, recipes, ingredients, inventoryData) {
    const summaryArray = [];
    
    // Header row
    summaryArray.push([
      'STT',
      'Tên món',
      'Nguyên liệu',
      'Đơn vị',
      'Số lượng cần',
      'Số lượng có',
      'Có thể làm',
      'Ghi chú'
    ]);

    let rowIndex = 1;
    
    menuItems.forEach(menuItem => {
      const recipe = recipes[menuItem.id];
      if (recipe && Object.keys(recipe).length > 0) {
        Object.entries(recipe).forEach(([ingredientId, amount]) => {
          const ingredient = ingredients.find(ing => 
            ing.id === ingredientId || 
            ing.id === parseInt(ingredientId).toString() ||
            ing.ingredientId === parseInt(ingredientId)
          );
          
          if (ingredient) {
            const requiredAmount = typeof amount === 'object' ? amount.amount : amount;
            const availableAmount = inventoryData[ingredientId] || 0;
            const canMake = Math.floor(availableAmount / requiredAmount);
            
            summaryArray.push([
              rowIndex++,
              menuItem.name,
              ingredient.name,
              ingredient.unit,
              requiredAmount,
              availableAmount,
              canMake,
              canMake > 0 ? 'Có thể làm' : 'Thiếu nguyên liệu'
            ]);
          }
        });
      }
    });

    return summaryArray;
  }

  // Xuất file Excel với template
  async exportToExcel(inventoryData, ingredients, menuItems, recipes) {
    try {
      // Tạo workbook mới
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Kiểm kê nguyên liệu
      const inventorySheet = this.generateInventoryData(inventoryData, ingredients);
      const ws1 = XLSX.utils.aoa_to_sheet(inventorySheet);
      
      // Định dạng header
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
      
      // Áp dụng style cho header row
      const range = XLSX.utils.decode_range(ws1['!ref']);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws1[cellAddress]) ws1[cellAddress] = {};
        ws1[cellAddress].s = headerStyle;
      }

      // Đặt độ rộng cột
      ws1['!cols'] = [
        { wch: 5 },   // STT
        { wch: 25 },  // Tên nguyên liệu
        { wch: 10 },  // Đơn vị
        { wch: 15 },  // Số lượng hiện có
        { wch: 15 },  // Số lượng kiểm kê
        { wch: 12 },  // Chênh lệch
        { wch: 20 }   // Ghi chú
      ];

      XLSX.utils.book_append_sheet(workbook, ws1, 'Kiểm kê nguyên liệu');

      // Sheet 2: Báo cáo tổng hợp
      const summarySheet = this.generateSummaryData(menuItems, recipes, ingredients, inventoryData);
      const ws2 = XLSX.utils.aoa_to_sheet(summarySheet);
      
      // Áp dụng style cho header row của sheet 2
      const range2 = XLSX.utils.decode_range(ws2['!ref']);
      for (let col = range2.s.c; col <= range2.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws2[cellAddress]) ws2[cellAddress] = {};
        ws2[cellAddress].s = headerStyle;
      }

      // Đặt độ rộng cột cho sheet 2
      ws2['!cols'] = [
        { wch: 5 },   // STT
        { wch: 20 },  // Tên món
        { wch: 20 },  // Nguyên liệu
        { wch: 10 },  // Đơn vị
        { wch: 12 },  // Số lượng cần
        { wch: 12 },  // Số lượng có
        { wch: 12 },  // Có thể làm
        { wch: 20 }   // Ghi chú
      ];

      XLSX.utils.book_append_sheet(workbook, ws2, 'Báo cáo tổng hợp');

      // Xuất file
      const fileName = `Kiem_ke_nguyen_lieu_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return {
        success: true,
        fileName: fileName,
        message: 'Xuất file Excel thành công!'
      };

    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      return {
        success: false,
        error: error.message,
        message: 'Có lỗi xảy ra khi xuất file Excel!'
      };
    }
  }

  // Xuất file Excel với layout 2 cột - Tên nguyên liệu và Bán được
  exportSimpleInventory(inventoryData, ingredients) {
    try {
      const workbook = XLSX.utils.book_new();
      const fixedOrder = this.getFixedIngredientOrder();
      
      // Tạo dữ liệu với layout 2 cột
      const data = [];
      
      // Header row
      data.push(['Tên nguyên liệu', 'Bán Được']);

      // Data rows - mỗi nguyên liệu một hàng
      fixedOrder.forEach((ingredientName) => {
        // Tìm ingredient trong danh sách ingredients
        const ingredient = ingredients.find(ing => 
          ing.name.toUpperCase() === ingredientName.toUpperCase() ||
          ing.name.toUpperCase().includes(ingredientName.toUpperCase()) ||
          ingredientName.toUpperCase().includes(ing.name.toUpperCase())
        );
        
        if (ingredient) {
          // Tìm trong inventoryData
          const ingredientId = Object.keys(inventoryData).find(id => {
            const invIngredient = ingredients.find(ing => 
              ing.id === id || 
              ing.id === parseInt(id).toString() ||
              ing.ingredientId === parseInt(id)
            );
            return invIngredient && invIngredient.id === ingredient.id;
          });
          
          const quantity = ingredientId ? (inventoryData[ingredientId] || 0) : 0;
          data.push([ingredientName, quantity]);
        } else {
          // Nếu không tìm thấy ingredient, vẫn thêm vào với số lượng 0
          data.push([ingredientName, 0]);
        }
      });

      // Tạo worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);
      
      // Định dạng header
      const headerStyle = {
        font: { 
          bold: true, 
          color: { rgb: "FFFFFF" },
          size: 14
        },
        fill: { fgColor: { rgb: "2E5984" } },
        alignment: { 
          horizontal: "center", 
          vertical: "center" 
        },
        border: {
          top: { style: "thick", color: { rgb: "000000" } },
          bottom: { style: "thick", color: { rgb: "000000" } },
          left: { style: "thick", color: { rgb: "000000" } },
          right: { style: "thick", color: { rgb: "000000" } }
        }
      };
      
      // Áp dụng style cho header row
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = {};
        ws[cellAddress].s = headerStyle;
      }

      // Thêm style cho data rows để tách biệt với header
      const dataStyle = {
        font: { size: 12 },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } }
        }
      };

      // Áp dụng style cho data rows
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddress]) ws[cellAddress] = {};
          ws[cellAddress].s = dataStyle;
        }
      }

      // Đặt độ rộng cột
      ws['!cols'] = [
        { wch: 30 },  // Cột "Tên nguyên liệu"
        { wch: 15 }   // Cột "Bán Được"
      ];

      XLSX.utils.book_append_sheet(workbook, ws, 'Bán được');

      // Xuất file
      const fileName = `Ban_duoc_nguyen_lieu_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return {
        success: true,
        fileName: fileName,
        message: 'Xuất file Excel theo layout 2 cột thành công!'
      };

    } catch (error) {
      console.error('Lỗi khi xuất Excel đơn giản:', error);
      return {
        success: false,
        error: error.message,
        message: 'Có lỗi xảy ra khi xuất file Excel!'
      };
    }
  }

  // Xuất file Excel với template từ URL
  async exportWithTemplate(templateUrl, inventoryData, ingredients, menuItems, recipes) {
    try {
      // Tải template từ URL
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error('Không thể tải template từ URL');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Lấy sheet đầu tiên
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Tìm vị trí bắt đầu dữ liệu (bỏ qua header)
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      let dataStartRow = 1; // Bắt đầu từ row 2 (index 1)

      // Tìm dòng trống đầu tiên để chèn dữ liệu
      for (let row = 1; row <= range.e.r; row++) {
        const cellA = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (!worksheet[cellA] || !worksheet[cellA].v) {
          dataStartRow = row;
          break;
        }
      }

      // Chèn dữ liệu kiểm kê theo thứ tự cố định
      const inventoryDataArray = this.generateInventoryData(inventoryData, ingredients);
      
      // Bỏ qua header row, chỉ lấy data
      const dataRows = inventoryDataArray.slice(1);
      
      dataRows.forEach((row, index) => {
        row.forEach((cellValue, colIndex) => {
          const cellAddress = XLSX.utils.encode_cell({ 
            r: dataStartRow + index, 
            c: colIndex 
          });
          worksheet[cellAddress] = { v: cellValue };
        });
      });

      // Cập nhật range
      const newRange = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: dataStartRow + dataRows.length - 1, c: 6 }
      });
      worksheet['!ref'] = newRange;

      // Xuất file
      const fileName = `Kiem_ke_nguyen_lieu_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return {
        success: true,
        fileName: fileName,
        message: 'Xuất file Excel với template thành công!'
      };

    } catch (error) {
      console.error('Lỗi khi xuất Excel với template:', error);
      return {
        success: false,
        error: error.message,
        message: 'Có lỗi xảy ra khi xuất file Excel với template!'
      };
    }
  }
}

// Tạo instance duy nhất
const excelService = new ExcelService();

export default excelService;
