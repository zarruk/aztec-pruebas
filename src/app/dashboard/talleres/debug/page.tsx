'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugIndexPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Herramientas de Depuración para Talleres</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle>Taller en Vivo (Versión Corregida)</CardTitle>
            <CardDescription>
              Versión corregida que soluciona los problemas identificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Esta versión utiliza un enfoque en dos pasos para crear correctamente un taller en vivo.
            </p>
            <Link href="/dashboard/talleres/debug-taller-fixed">
              <Button className="bg-green-600 hover:bg-green-700">Ir a la herramienta</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Depuración SQL</CardTitle>
            <CardDescription>
              Herramienta avanzada para probar diferentes formatos de array
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Esta herramienta prueba diferentes formatos de array para fecha_vivo y verifica la estructura de la tabla.
            </p>
            <Link href="/dashboard/talleres/debug-sql">
              <Button className="bg-blue-600 hover:bg-blue-700">Ir a la herramienta</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle>Nuevo Formulario</CardTitle>
            <CardDescription>
              Formulario corregido sin campos_webhook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Versión actualizada del formulario que elimina campos_webhook y corrige los problemas con fecha_vivo.
            </p>
            <Link href="/dashboard/talleres/nuevo">
              <Button className="bg-purple-600 hover:bg-purple-700">Ir al formulario</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Taller en Vivo (String)</CardTitle>
            <CardDescription>
              Prueba la creación de un taller en vivo con fecha_vivo como string
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Esta versión utiliza un string para fecha_vivo, como se define en el esquema de la base de datos.
            </p>
            <Link href="/dashboard/talleres/debug-taller-string">
              <Button>Ir a la herramienta</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Taller en Vivo (Array)</CardTitle>
            <CardDescription>
              Prueba la creación de un taller en vivo con fecha_vivo como array
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Esta versión utiliza un array para fecha_vivo, como se usa en algunas partes del código.
            </p>
            <Link href="/dashboard/talleres/debug-taller-array">
              <Button>Ir a la herramienta</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Taller en Vivo (Simple)</CardTitle>
            <CardDescription>
              Prueba la creación de un taller en vivo con un formulario simple
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Versión simplificada para probar la creación básica de un taller en vivo.
            </p>
            <Link href="/dashboard/talleres/debug-taller">
              <Button>Ir a la herramienta</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Verificar Estructura</CardTitle>
            <CardDescription>
              Verifica la estructura de la tabla talleres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Muestra la estructura actual de la tabla talleres en Supabase.
            </p>
            <Link href="/dashboard/talleres/debug-page">
              <Button>Ir a la herramienta</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Formulario Original</CardTitle>
            <CardDescription>
              Formulario original de creación de talleres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Accede al formulario original de creación de talleres.
            </p>
            <Link href="/dashboard/talleres/nuevo">
              <Button>Ir al formulario</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Formulario Simple</CardTitle>
            <CardDescription>
              Formulario simple para crear talleres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Versión simplificada del formulario original.
            </p>
            <Link href="/dashboard/talleres/nuevo-simple">
              <Button>Ir al formulario</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 