<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
{
    return true;
}

public function rules()
{
    return [
        'client_name' => 'required|string|max:255',
        'project_name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'status' => 'required|in:Planning,In Progress,On Hold,Completed',
        'priority' => 'required|in:Low,Medium,High',
        'start_date' => 'required|date',
        'due_date' => 'required|date|after_or_equal:start_date',
    ];
}
}
