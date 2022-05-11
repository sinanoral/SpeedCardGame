﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Server.Models.Database;

#nullable disable

namespace Server.Migrations
{
    [DbContext(typeof(GameResultContext))]
    partial class GameResultContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Server.Models.Database.GameResultDao", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("Created")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("Daily")
                        .HasColumnType("boolean");

                    b.Property<int>("DailyIndex")
                        .HasColumnType("integer");

                    b.Property<int>("EloGained")
                        .HasColumnType("integer");

                    b.Property<int>("EloLost")
                        .HasColumnType("integer");

                    b.Property<Guid>("LoserId")
                        .HasColumnType("uuid");

                    b.Property<int>("LostBy")
                        .HasColumnType("integer");

                    b.Property<int>("Turns")
                        .HasColumnType("integer");

                    b.Property<Guid>("WinnerId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("LoserId");

                    b.HasIndex("WinnerId");

                    b.ToTable("GameResult");
                });

            modelBuilder.Entity("Server.Models.Database.PlayerDao", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<int>("DailyLosses")
                        .HasColumnType("integer");

                    b.Property<int>("DailyWinStreak")
                        .HasColumnType("integer");

                    b.Property<int>("DailyWins")
                        .HasColumnType("integer");

                    b.Property<int>("Elo")
                        .HasColumnType("integer");

                    b.Property<bool>("IsBot")
                        .HasColumnType("boolean");

                    b.Property<int>("Losses")
                        .HasColumnType("integer");

                    b.Property<int>("MaxDailyWinStreak")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("Wins")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.ToTable("Player");
                });

            modelBuilder.Entity("Server.Models.Database.GameResultDao", b =>
                {
                    b.HasOne("Server.Models.Database.PlayerDao", "Loser")
                        .WithMany()
                        .HasForeignKey("LoserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Server.Models.Database.PlayerDao", "Winner")
                        .WithMany()
                        .HasForeignKey("WinnerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Loser");

                    b.Navigation("Winner");
                });
#pragma warning restore 612, 618
        }
    }
}
