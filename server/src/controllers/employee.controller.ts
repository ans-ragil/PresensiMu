import { Request, Response, NextFunction } from 'express';
import { employeeService } from '../services/employee.service';

export class EmployeeController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, divisiId, jabatanId, shiftId, isActive, page, limit } = req.query;

      const result = await employeeService.getAll({
        search: search as string,
        divisiId: divisiId as string,
        jabatanId: jabatanId as string,
        shiftId: shiftId as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await employeeService.getById(req.params.id);
      res.json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await employeeService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Karyawan berhasil ditambahkan',
        data: employee
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await employeeService.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Data karyawan berhasil diperbarui',
        data: employee
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await employeeService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Karyawan berhasil dinonaktifkan'
      });
    } catch (error) {
      next(error);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      await employeeService.restore(req.params.id);
      res.json({
        success: true,
        message: 'Karyawan berhasil diaktifkan kembali'
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword } = req.body;
      await employeeService.changePassword(req.params.id, newPassword);
      res.json({
        success: true,
        message: 'Password berhasil diubah'
      });
    } catch (error) {
      next(error);
    }
  }

  // Division
  async getDivisions(_req: Request, res: Response, next: NextFunction) {
    try {
      const divisions = await employeeService.getDivisions();
      res.json({ success: true, data: divisions });
    } catch (error) {
      next(error);
    }
  }

  async createDivision(req: Request, res: Response, next: NextFunction) {
    try {
      const division = await employeeService.createDivision(req.body);
      res.status(201).json({
        success: true,
        message: 'Divisi berhasil ditambahkan',
        data: division
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDivision(req: Request, res: Response, next: NextFunction) {
    try {
      const division = await employeeService.updateDivision(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Divisi berhasil diperbarui',
        data: division
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDivision(req: Request, res: Response, next: NextFunction) {
    try {
      await employeeService.deleteDivision(req.params.id);
      res.json({
        success: true,
        message: 'Divisi berhasil dinonaktifkan'
      });
    } catch (error) {
      next(error);
    }
  }

  // Position
  async getPositions(_req: Request, res: Response, next: NextFunction) {
    try {
      const positions = await employeeService.getPositions();
      res.json({ success: true, data: positions });
    } catch (error) {
      next(error);
    }
  }

  async createPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const position = await employeeService.createPosition(req.body);
      res.status(201).json({
        success: true,
        message: 'Jabatan berhasil ditambahkan',
        data: position
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePosition(req: Request, res: Response, next: NextFunction) {
    try {
      const position = await employeeService.updatePosition(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Jabatan berhasil diperbarui',
        data: position
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePosition(req: Request, res: Response, next: NextFunction) {
    try {
      await employeeService.deletePosition(req.params.id);
      res.json({
        success: true,
        message: 'Jabatan berhasil dinonaktifkan'
      });
    } catch (error) {
      next(error);
    }
  }

  // Shift
  async getShifts(_req: Request, res: Response, next: NextFunction) {
    try {
      const shifts = await employeeService.getShifts();
      res.json({ success: true, data: shifts });
    } catch (error) {
      next(error);
    }
  }

  async createShift(req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await employeeService.createShift(req.body);
      res.status(201).json({
        success: true,
        message: 'Shift berhasil ditambahkan',
        data: shift
      });
    } catch (error) {
      next(error);
    }
  }

  async updateShift(req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await employeeService.updateShift(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Shift berhasil diperbarui',
        data: shift
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteShift(req: Request, res: Response, next: NextFunction) {
    try {
      await employeeService.deleteShift(req.params.id);
      res.json({
        success: true,
        message: 'Shift berhasil dinonaktifkan'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
