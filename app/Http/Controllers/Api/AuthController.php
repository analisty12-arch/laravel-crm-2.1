<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function mapRole($user)
    {
        // Administrador receives adm_geral role
        if ($user->id === 1)
            return 'adm_geral';

        $roleName = strtolower($user->role->name ?? '');

        if (str_contains($roleName, 'admin'))
            return 'Adm';
        if (str_contains($roleName, 'rh') || str_contains($roleName, 'hr'))
            return 'RH';
        if (str_contains($roleName, 'gestor') || str_contains($roleName, 'manager'))
            return 'Gestor';
        if (str_contains($roleName, 'ti') || str_contains($roleName, 'it'))
            return 'TI';

        return 'Colaborador';
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');
        $credentials['status'] = 1;

        \Illuminate\Support\Facades\Log::info('Login attempt', ['email' => $request->email, 'password' => $request->password]);

        if (!Auth::guard('user')->attempt($credentials)) {
            \Illuminate\Support\Facades\Log::error('Login failed for: ' . $request->email);
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('checklist-spa')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $this->mapRole($user),
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $this->mapRole($user),
        ]);
    }
}
