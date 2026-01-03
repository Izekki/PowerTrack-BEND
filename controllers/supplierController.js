import {SupplierModel} from '../models/supplierModel.js';

export const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await SupplierModel.getSuppliers()
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los proveedores', error: error.message });
    }
};

export const getSupplier = async (req, res) => {
    const { id } = req.params;

    try {
        const supplier = await SupplierModel.getSupplierById(id);
        if (!supplier) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el proveedor', error: error.message });
    }
};

export const registerSupplier = async (req, res) => {
    const { nombre, cargo_fijo, cargo_variable, cargo_distribucion, cargo_capacidad, region, demanda_minima, factor_carga } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: "Nombre requerido" });
    }

    const requiredFields = { cargo_fijo, cargo_variable, cargo_distribucion, cargo_capacidad, demanda_minima, factor_carga };
    const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => value === undefined || value === null)
        .map(([key]) => key);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Campos requeridos faltantes",
            missing: missingFields
        });
    }

    try {
        const newSupplier = await SupplierModel.createSupplier({ input: {
            nombre, cargo_fijo, cargo_variable, cargo_distribucion, cargo_capacidad, region, demanda_minima, factor_carga
        } });
        res.status(201).json({ message: "Proveedor creado exitosamente", supplier: newSupplier });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el proveedor', error: error.message });
    }
};

export const updateSupplier = async (req, res) => {
    const { id } = req.params;
    const { name, contact } = req.body;

    if (!name && !contact) {
        return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
    }

    try {
        const updatedSupplier = await SupplierModel.updateSupplierById(id, { name, contact });
        if (!updatedSupplier) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.status(200).json({ message: "Proveedor actualizado exitosamente", updatedSupplier });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el proveedor', error: error.message });
    }
};

export const deleteSupplier = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSupplier = await SupplierModel.deleteSupplierById(id);
        if (!deletedSupplier) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.status(200).json({ message: "Proveedor eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el proveedor', error: error.message });
    }
};
