<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('project_name');
            $table->text('description')->nullable();
            $table->enum('status', ['Planning', 'In Progress', 'On Hold', 'Completed']);
            $table->enum('priority', ['Low', 'Medium', 'High']);
            $table->date('start_date');
            $table->date('due_date');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
};